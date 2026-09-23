import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const screenshotDirectory = path.join(repositoryRoot, "store-assets", "microsoft-edge-addons", "screenshots");
const shouldCaptureScreenshots = process.argv.includes("--screenshots");
const edgeCandidates = [
  process.env.EDGE_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);

const edgePath = edgeCandidates.find((candidate) => {
  try {
    return process.getBuiltinModule("fs").existsSync(candidate);
  } catch {
    return false;
  }
});

if (!edgePath) {
  throw new Error("Microsoft Edge wurde nicht gefunden. Optional EDGE_PATH setzen.");
}

async function main() {
const profileDirectory = await mkdtemp(path.join(os.tmpdir(), "startpane-edge-smoke-"));
let edgeProcess;
let browserCdp;
let cdp;
let edgeLogs = "";

try {
  edgeProcess = spawn(edgePath, [
    "--disable-gpu",
    "--hide-scrollbars",
    "--disable-sync",
    "--disable-features=DisableLoadExtensionCommandLineSwitch,DisableDisableExtensionsExceptCommandLineSwitch",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profileDirectory}`,
    "--remote-debugging-pipe",
    "--enable-unsafe-extension-debugging",
    "--window-size=1280,800",
    "--window-position=-32000,-32000",
    "about:blank"
  ], { stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"], windowsHide: true });
  edgeProcess.stdout.on("data", (chunk) => { edgeLogs = `${edgeLogs}${chunk}`.slice(-6000); });
  edgeProcess.stderr.on("data", (chunk) => { edgeLogs = `${edgeLogs}${chunk}`.slice(-6000); });

  browserCdp = new CdpPipeClient(edgeProcess.stdio[3], edgeProcess.stdio[4]);
  const loadedExtension = await browserCdp.send("Extensions.loadUnpacked", { path: repositoryRoot });
  assert.match(loadedExtension.id, /^[a-p]{32}$/);
  const extensionUrl = `chrome-extension://${loadedExtension.id}/newtab.html`;
  const { targetId } = await browserCdp.send("Target.createTarget", { url: "edge://newtab/" });
  const { sessionId } = await browserCdp.send("Target.attachToTarget", { targetId, flatten: true });
  cdp = browserCdp.session(sessionId);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await waitFor(cdp, `location.href === ${JSON.stringify(extensionUrl)}`);
  assert.equal(await evaluate(cdp, "chrome.runtime.id"), loadedExtension.id);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await waitForApp(cdp);

  const manifest = await evaluate(cdp, "chrome.runtime.getManifest()");
  assert.equal(manifest.name, "StartPane");
  assert.equal(manifest.version, "1.1.0");
  assert.equal(manifest.chrome_url_overrides?.newtab, "newtab.html");
  assert.equal(await evaluate(cdp, "typeof chrome.search?.query"), "function");

  const initial = await evaluate(cdp, `({
    title: document.title,
    providerLabels: [...document.querySelectorAll('.engine-button')].map((button) => button.textContent),
    activeLabel: document.querySelector('.engine-button.active')?.textContent,
    panelHidden: document.querySelector('#settingsPanel')?.getAttribute('aria-hidden')
  })`);
  assert.equal(initial.title.length > 0, true);
  assert.deepEqual(initial.providerLabels, ["Edge-Standard", "YouTube", "Google Maps"]);
  assert.equal(initial.activeLabel, "Edge-Standard");
  assert.equal(initial.panelHidden, "true");

  if (shouldCaptureScreenshots) {
    await mkdir(screenshotDirectory, { recursive: true });
    await captureScreenshot(cdp, path.join(screenshotDirectory, "01-startseite-de.png"));
  }

  await evaluate(cdp, `(() => {
    document.querySelector('#settingsButton').click();
    document.querySelector('[data-settings-tab="search"]').click();
    return true;
  })()`);
  await waitFor(cdp, "document.querySelector('#settingsPageSearch')?.hidden === false");

  const searchSettings = await evaluate(cdp, `({
    defaultOptions: [...document.querySelectorAll('#defaultSearchSelect option')].map((option) => option.textContent),
    additionalCount: document.querySelectorAll('.provider-item').length,
    addDisabled: document.querySelector('#searchProviderForm button[type="submit"]').disabled,
    mainInert: document.querySelector('#pageShell').inert,
    panelInert: document.querySelector('#settingsPanel').inert
  })`);
  assert.deepEqual(searchSettings.defaultOptions, ["Edge-Standard", "YouTube", "Google Maps"]);
  assert.equal(searchSettings.additionalCount, 2);
  assert.equal(searchSettings.addDisabled, false);
  assert.equal(searchSettings.mainInert, true);
  assert.equal(searchSettings.panelInert, false);

  if (shouldCaptureScreenshots) {
    await delay(350);
    await captureScreenshot(cdp, path.join(screenshotDirectory, "02-sucheinstellungen-de.png"));
  }

  await evaluate(cdp, `(() => {
    document.querySelector('#closeSettingsButton').click();
    [...document.querySelectorAll('.engine-button')]
      .find((button) => button.textContent === 'YouTube').click();
    document.querySelector('#settingsButton').click();
    return true;
  })()`);
  assert.equal(await evaluate(cdp, "document.querySelector('#defaultSearchSelect').value"), "youtube");
  await evaluate(cdp, `(() => {
    const select = document.querySelector('#defaultSearchSelect');
    select.value = 'browser';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await waitFor(cdp, "document.querySelector('.engine-button.active')?.textContent === 'Edge-Standard'");

  await evaluate(cdp, `(() => {
    document.querySelector('#providerLabelInput').value = 'Find';
    document.querySelector('#providerUrlInput').value = 'https://example.com/search?term={query}';
    document.querySelector('#searchProviderForm').requestSubmit();
    return true;
  })()`);
  await waitFor(cdp, "[...document.querySelectorAll('.engine-button')].some((button) => button.textContent === 'Find')");

  const storedAfterAdd = await evaluate(cdp, "chrome.storage.local.get('settings')");
  assert.equal(storedAfterAdd.settings.searchProviders.length, 3);
  assert.equal(
    storedAfterAdd.settings.searchProviders.find((provider) => provider.label === "Find")?.url,
    "https://example.com/search?term={query}"
  );
  assert.equal(
    storedAfterAdd.settings.searchProviderId,
    storedAfterAdd.settings.searchProviders.find((provider) => provider.label === "Find")?.id
  );
  assert.equal(await evaluate(cdp, "document.querySelector('#searchProviderForm button[type=submit]').disabled"), true);

  await evaluate(cdp, `(() => {
    const form = [...document.querySelectorAll('.provider-item')]
      .find((item) => item.querySelector('input')?.value === 'Find');
    const inputs = form.querySelectorAll('input');
    inputs[0].value = 'Find Pro';
    inputs[1].value = 'https://example.com/search?term={query}&src=startpane';
    form.requestSubmit();
    return true;
  })()`);
  await waitFor(cdp, "[...document.querySelectorAll('.engine-button')].some((button) => button.textContent === 'Find Pro')");
  const storedAfterEdit = await evaluate(cdp, "chrome.storage.local.get('settings')");
  assert.equal(
    storedAfterEdit.settings.searchProviders.find((provider) => provider.label === "Find Pro")?.url,
    "https://example.com/search?term={query}&src=startpane"
  );

  await evaluate(cdp, `(() => {
    const forms = [...document.querySelectorAll('.provider-item')];
    const mapsForm = forms.find((form) => form.querySelector('input')?.value === 'Google Maps');
    mapsForm.querySelector('button[title]').click();
    return true;
  })()`);
  await waitFor(cdp, "document.querySelectorAll('.provider-item').length === 2");

  await cdp.send("Page.reload", { ignoreCache: true });
  await waitForApp(cdp);
  assert.equal(await evaluate(cdp, "document.querySelector('.engine-button.active')?.textContent"), "Find Pro");

  await evaluate(cdp, `(() => {
    document.querySelector('#searchInput').value = 'edge parity 47291';
    document.querySelector('#searchForm').requestSubmit();
    return true;
  })()`);
  await waitForUrl(cdp, (url) => url.includes("example.com/search") && url.includes("edge%20parity%2047291") && url.includes("src=startpane"));

  await cdp.send("Page.navigate", { url: extensionUrl });
  await waitForApp(cdp);
  await evaluate(cdp, `(() => {
    [...document.querySelectorAll('.engine-button')]
      .find((button) => button.textContent === 'Edge-Standard')
      .click();
    document.querySelector('#searchInput').value = 'startpaneedge47291';
    document.querySelector('#searchForm').requestSubmit();
    return true;
  })()`);
  const nativeSearchUrl = await waitForUrl(cdp, (url) => !url.startsWith("chrome-extension://") && url.includes("startpaneedge47291"));
  assert.match(nativeSearchUrl, /^https:\/\//);

  console.log(`StartPane Edge smoke test passed. Native search URL: ${nativeSearchUrl}`);
  if (shouldCaptureScreenshots) {
    console.log(`Store screenshots written to: ${screenshotDirectory}`);
  }
} catch (error) {
  if (edgeLogs.trim()) {
    error.message = `${error.message}\nEdge-Log:\n${edgeLogs.trim()}`;
  }
  throw error;
} finally {
  browserCdp?.close();
  if (edgeProcess && !edgeProcess.killed) {
    edgeProcess.kill();
  }
  const resolvedProfile = path.resolve(profileDirectory);
  const resolvedTemp = path.resolve(os.tmpdir()) + path.sep;
  if (resolvedProfile.startsWith(resolvedTemp) && path.basename(resolvedProfile).startsWith("startpane-edge-smoke-")) {
    await rm(resolvedProfile, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 });
  }
}
}

async function waitForApp(client) {
  await waitFor(client, "document.readyState === 'complete' && Boolean(document.querySelector('#searchForm'))");
}

async function waitFor(client, expression, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) {
      return;
    }
    await delay(100);
  }
  throw new Error(`Zeitüberschreitung beim Edge-Test: ${expression}`);
}

async function waitForUrl(client, predicate, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const url = await evaluate(client, "location.href").catch(() => "");
    if (predicate(url)) {
      return url;
    }
    await delay(100);
  }
  throw new Error("Edge navigierte nicht zum erwarteten Suchziel.");
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "Runtime.evaluate fehlgeschlagen.");
  }
  return response.result?.value;
}

async function captureScreenshot(client, outputPath) {
  const response = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  await writeFile(outputPath, Buffer.from(response.data, "base64"));
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class CdpPipeClient {
  constructor(writeStream, readStream) {
    this.writeStream = writeStream;
    this.readStream = readStream;
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = Buffer.alloc(0);
    readStream.on("data", (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      let delimiterIndex = this.buffer.indexOf(0);
      while (delimiterIndex !== -1) {
        const frame = this.buffer.subarray(0, delimiterIndex);
        this.buffer = this.buffer.subarray(delimiterIndex + 1);
        if (frame.length) {
          this.handleMessage(JSON.parse(frame.toString("utf8")));
        }
        delimiterIndex = this.buffer.indexOf(0);
      }
    });
    readStream.on("close", () => {
      this.rejectPending("DevTools-Pipe wurde geschlossen.");
    });
    readStream.on("error", (error) => {
      this.rejectPending(error.message);
    });
  }

  handleMessage(message) {
      if (!message.id || !this.pending.has(message.id)) {
        return;
      }
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
  }

  rejectPending(message) {
    for (const { reject } of this.pending.values()) {
      reject(new Error(message));
    }
    this.pending.clear();
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.writeStream.write(`${JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })}\0`);
    });
  }

  session(sessionId) {
    return {
      send: (method, params = {}) => this.send(method, params, sessionId)
    };
  }

  close() {
    this.writeStream.destroy();
    this.readStream.destroy();
  }
}

await main();

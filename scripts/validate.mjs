import { spawnSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

async function fileExists(relativePath) {
  try {
    await access(path.join(repositoryRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  const source = await readFile(path.join(repositoryRoot, relativePath), "utf8");
  try {
    return JSON.parse(source);
  } catch (error) {
    errors.push(`${relativePath} enthält ungültiges JSON: ${error.message}`);
    return {};
  }
}

async function findFiles(relativeDirectory, extension) {
  const directory = path.join(repositoryRoot, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findFiles(relativePath, extension));
    } else if (entry.isFile() && relativePath.endsWith(extension)) {
      files.push(relativePath);
    }
  }

  return files;
}

function readPngDimensions(buffer) {
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

const manifest = await readJson("manifest.json");
const packageMetadata = await readJson("package.json");

check(manifest.manifest_version === 3, "manifest.json muss Manifest V3 verwenden.");
check(manifest.name === "__MSG_extensionName__", "Der Erweiterungsname muss aus den Locales kommen.");
check(manifest.description === "__MSG_extensionDescription__", "Die Beschreibung muss aus den Locales kommen.");
check(manifest.default_locale === "de", "Deutsch muss als Standard-Locale gesetzt sein.");
check(manifest.chrome_url_overrides?.newtab === "newtab.html", "newtab.html muss die Browserseite ‚Neuer Tab‘ ersetzen.");
check(Array.isArray(manifest.permissions) && manifest.permissions.includes("storage"), "Die storage-Berechtigung fehlt.");
check(Array.isArray(manifest.permissions) && manifest.permissions.includes("search"), "Die search-Berechtigung fehlt.");
check(Array.isArray(manifest.optional_host_permissions), "Optionale Host-Berechtigungen fehlen.");
check(
  manifest.optional_host_permissions?.every((pattern) => pattern.startsWith("https://")),
  "Optionale Host-Berechtigungen dürfen nur HTTPS-Ziele erlauben."
);
check(!Object.hasOwn(manifest, "browser_specific_settings"), "Firefox-spezifische Manifest-Einträge sind nicht erlaubt.");
check(manifest.content_security_policy?.extension_pages?.includes("script-src 'self'"), "Die CSP muss lokale Skripte erzwingen.");
check(!manifest.content_security_policy?.extension_pages?.includes("http:"), "Die CSP darf keine unverschlüsselten HTTP-Ressourcen erlauben.");
check(packageMetadata.version === manifest.version, "Versionen in package.json und manifest.json stimmen nicht überein.");

const requiredFiles = [
  "newtab.html",
  "css/styles.css",
  "js/app.js",
  "js/backgrounds.js",
  "js/i18n.js",
  "js/storage.js",
  "PRIVACY.md",
  "LICENSE"
];

for (const requiredFile of requiredFiles) {
  check(await fileExists(requiredFile), `Erforderliche Datei fehlt: ${requiredFile}`);
}

for (const size of [16, 32, 48, 128]) {
  const relativePath = manifest.icons?.[String(size)];
  check(Boolean(relativePath), `Manifest-Icon für ${size}×${size} Pixel fehlt.`);
  if (!relativePath || !await fileExists(relativePath)) {
    errors.push(`Icon-Datei für ${size}×${size} Pixel fehlt: ${relativePath || "kein Pfad"}`);
    continue;
  }

  const dimensions = readPngDimensions(await readFile(path.join(repositoryRoot, relativePath)));
  check(
    dimensions?.width === size && dimensions?.height === size,
    `${relativePath} muss exakt ${size}×${size} Pixel groß sein.`
  );
}

const localeEntries = await readdir(path.join(repositoryRoot, "_locales"), { withFileTypes: true });
const localeDirectories = localeEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
check(localeDirectories.includes(manifest.default_locale), "Für die Standard-Locale fehlt ein Verzeichnis.");

for (const locale of localeDirectories) {
  const relativePath = path.join("_locales", locale, "messages.json");
  const messages = await readJson(relativePath);
  check(messages.extensionName?.message === "Benni New Tab", `${relativePath}: falscher Erweiterungsname.`);
  check(Boolean(messages.extensionDescription?.message), `${relativePath}: Beschreibung fehlt.`);
  check(!/Microsoft Edge/i.test(messages.extensionDescription?.message || ""), `${relativePath}: Edge-spezifische Beschreibung gefunden.`);
  check(!/Firefox|BraveLikeNewTab/i.test(JSON.stringify(messages)), `${relativePath}: altes Branding gefunden.`);
}

const javascriptFiles = await findFiles("js", ".js");
for (const relativePath of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", path.join(repositoryRoot, relativePath)], {
    encoding: "utf8"
  });
  check(result.status === 0, `${relativePath}: JavaScript-Syntaxfehler\n${result.stderr.trim()}`);
}

const appSource = await readFile(path.join(repositoryRoot, "js/app.js"), "utf8");
const storageSource = await readFile(path.join(repositoryRoot, "js/storage.js"), "utf8");
const privacySource = await readFile(path.join(repositoryRoot, "PRIVACY.md"), "utf8");
check(appSource.includes("extensionApi.search.query"), "Allgemeine Websuchen müssen die Chrome-Such-API verwenden.");
check(storageSource.indexOf('id: "browser"') < storageSource.indexOf('id: "youtube"'), "Die Browser-Standardsuche muss die erste Suchoption sein.");
check(storageSource.includes('protocol !== "https:"'), "Nutzer-URLs müssen auf HTTPS begrenzt sein.");
check(privacySource.includes("maherrasho@gmail.com"), "Die Datenschutz-Kontaktadresse fehlt.");

const runtimeTextFiles = [
  "manifest.json",
  "newtab.html",
  "css/styles.css",
  ...javascriptFiles,
  ...localeDirectories.map((locale) => path.join("_locales", locale, "messages.json"))
];

for (const relativePath of runtimeTextFiles) {
  const content = await readFile(path.join(repositoryRoot, relativePath), "utf8");
  check(!/Firefox|BraveLikeNewTab|browser_specific_settings|gecko/i.test(content), `${relativePath}: altes Firefox- oder Projekt-Branding gefunden.`);
}

if (errors.length) {
  console.error(`Validierung fehlgeschlagen (${errors.length} Fehler):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Benni New Tab ${manifest.version}: Chrome-Web-Store-Paket erfolgreich validiert.`);

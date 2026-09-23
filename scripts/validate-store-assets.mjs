import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const assetRoot = path.join(repositoryRoot, "store-assets", "microsoft-edge-addons");
const screenshotRoot = path.join(assetRoot, "screenshots");
const supportedLocales = ["de", "en", "es", "fr", "it", "pl", "ru"];
const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function inspectPng(buffer) {
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 33 || buffer.subarray(0, 8).toString("hex") !== signature) {
    return null;
  }

  const chunkTypes = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const chunkLength = buffer.readUInt32BE(offset);
    const chunkType = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    chunkTypes.push(chunkType);
    offset += chunkLength + 12;
    if (chunkType === "IEND") {
      break;
    }
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepthPerChannel: buffer[24],
    colorType: buffer[25],
    chunkTypes
  };
}

function checkRgbPng(png, label) {
  check(Boolean(png), `${label}: keine gültige PNG-Datei.`);
  if (!png) {
    return;
  }
  check(png.bitDepthPerChannel === 8, `${label}: erwartet werden 8 Bit je RGB-Kanal.`);
  check(png.colorType === 2, `${label}: erwartet wird PNG-Farbtyp 2 (RGB ohne Alphakanal).`);
  check(!png.chunkTypes.includes("tRNS"), `${label}: Transparenz-Chunk tRNS ist nicht erlaubt.`);
}

const logoPath = path.join(assetRoot, "logo-300.png");
const logo = inspectPng(await readFile(logoPath));
checkRgbPng(logo, "logo-300.png");
if (logo) {
  check(logo.width === 300 && logo.height === 300, `logo-300.png: erwartet werden 300×300 statt ${logo.width}×${logo.height}.`);
}

for (const locale of supportedLocales) {
  const descriptionPath = path.join(assetRoot, locale, "description.txt");
  check(await exists(descriptionPath), `${locale}: description.txt fehlt.`);
  if (!await exists(descriptionPath)) {
    continue;
  }
  const description = (await readFile(descriptionPath, "utf8")).trim();
  check(description.length >= 250 && description.length <= 10000, `${locale}: Beschreibung muss 250–10.000 Zeichen lang sein.`);
  check(description.includes("StartPane"), `${locale}: Produktname StartPane fehlt.`);
  check(/Microsoft Edge/i.test(description), `${locale}: Microsoft Edge fehlt.`);
  check(/chrome\.search/.test(description), `${locale}: transparente Erklärung der Edge-Search-API fehlt.`);
  check(!/\bChrome\b|Firefox|Benni New Tab|BraveLikeNewTab/.test(description), `${locale}: Fremdbrowser- oder altes Branding gefunden.`);
}

const screenshotFiles = await exists(screenshotRoot)
  ? (await readdir(screenshotRoot)).filter((file) => file.toLowerCase().endsWith(".png")).sort()
  : [];
check(screenshotFiles.length <= 6, "Es sind höchstens sechs Edge-Screenshots erlaubt.");

for (const file of screenshotFiles) {
  const png = inspectPng(await readFile(path.join(screenshotRoot, file)));
  checkRgbPng(png, file);
  if (!png) {
    continue;
  }
  const allowedDimensions = (
    (png.width === 1280 && png.height === 800)
    || (png.width === 640 && png.height === 480)
  );
  check(allowedDimensions, `${file}: unzulässige Abmessungen ${png.width}×${png.height}.`);
}

const submissionPath = path.join(assetRoot, "SUBMISSION.md");
check(await exists(submissionPath), "SUBMISSION.md fehlt.");
if (await exists(submissionPath)) {
  const submission = await readFile(submissionPath, "utf8");
  check(!/\bChrome\b|Firefox|Benni New Tab/.test(submission), "SUBMISSION.md enthält Fremdbrowser- oder altes Branding.");
}

if (errors.length) {
  console.error(`Edge-Store-Asset-Prüfung fehlgeschlagen (${errors.length} Fehler):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Edge-Store-Assets erfolgreich validiert: 1 Logo, ${supportedLocales.length} Beschreibungen, ${screenshotFiles.length} optionale Screenshots.`);

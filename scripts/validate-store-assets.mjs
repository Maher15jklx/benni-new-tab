import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const assetRoot = path.join(repositoryRoot, "store-assets", "chrome-web-store", "de");
const screenshotRoot = path.join(assetRoot, "screenshots");
const errors = [];

function check(condition, message) {
  if (!condition) {
    errors.push(message);
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

const manifest = JSON.parse(await readFile(path.join(assetRoot, "manifest.json"), "utf8"));
const screenshotFiles = (await readdir(screenshotRoot))
  .filter((file) => file.toLowerCase().endsWith(".png"))
  .sort();

check(screenshotFiles.length >= 1, "Mindestens ein Screenshot ist erforderlich.");
check(screenshotFiles.length <= 5, "Es sind höchstens fünf Screenshots erlaubt.");
check(manifest.locale === "de", "Das Exportmanifest muss die Locale de verwenden.");
check(manifest.exports?.length === screenshotFiles.length, "Exportmanifest und Screenshot-Anzahl stimmen nicht überein.");

for (const file of screenshotFiles) {
  const buffer = await readFile(path.join(screenshotRoot, file));
  const png = inspectPng(buffer);
  check(Boolean(png), `${file}: keine gültige PNG-Datei.`);
  if (!png) {
    continue;
  }

  const allowedDimensions = (
    (png.width === 1280 && png.height === 800)
    || (png.width === 640 && png.height === 400)
  );
  check(allowedDimensions, `${file}: unzulässige Abmessungen ${png.width}×${png.height}.`);
  check(png.bitDepthPerChannel === 8, `${file}: erwartet werden 8 Bit je RGB-Kanal.`);
  check(png.colorType === 2, `${file}: erwartet wird PNG-Farbtyp 2 (RGB ohne Alphakanal).`);
  check(!png.chunkTypes.includes("tRNS"), `${file}: Transparenz-Chunk tRNS ist nicht erlaubt.`);
  check(
    manifest.exports.some((item) => item.file === `screenshots/${file}`),
    `${file}: Eintrag im Exportmanifest fehlt.`
  );
}

if (errors.length) {
  console.error(`Store-Asset-Prüfung fehlgeschlagen (${errors.length} Fehler):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`${screenshotFiles.length} lokalisierte Store-Screenshots erfolgreich validiert: 1280×800, 24-Bit-RGB, ohne Alpha.`);

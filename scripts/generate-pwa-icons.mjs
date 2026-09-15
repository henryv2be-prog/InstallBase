import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconSvg = readFileSync(join(root, "assets", "app-icon.svg"));
const maskableSvg = readFileSync(join(root, "assets", "app-icon-maskable.svg"));
const badgeSvg = readFileSync(join(root, "assets", "app-icon-badge.svg"));
const outDir = join(root, "public", "icons");
const appDir = join(root, "src", "app");

/** Render the polished vector icon at an exact pixel size. */
async function renderAppIcon(size) {
  return sharp(iconSvg, { density: Math.max(192, size * 0.75) })
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/** Maskable variant: full-bleed gradient, mark in Android safe zone. */
async function renderMaskableIcon(size) {
  return sharp(maskableSvg, { density: Math.max(192, size * 0.75) })
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/** Notification badge: white iB silhouette on transparent background. */
async function renderNotificationBadge(size = 96) {
  return sharp(badgeSvg, { density: 192 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-192-maskable.png", 192, true],
  ["icon-512-maskable.png", 512, true],
];

for (const [filename, size, maskable] of targets) {
  const bytes = maskable ? await renderMaskableIcon(size) : await renderAppIcon(size);
  writeFileSync(join(outDir, filename), bytes);
  console.log(`→ wrote public/icons/${filename} (${bytes.length} bytes)`);
}

const badge = await renderNotificationBadge(96);
writeFileSync(join(outDir, "badge.png"), badge);
console.log("→ wrote public/icons/badge.png");

const favicon = await renderAppIcon(32);
writeFileSync(join(appDir, "icon.png"), favicon);
console.log("→ wrote src/app/icon.png");

const appleIcon = await renderAppIcon(180);
writeFileSync(join(appDir, "apple-icon.png"), appleIcon);
console.log("→ wrote src/app/apple-icon.png");

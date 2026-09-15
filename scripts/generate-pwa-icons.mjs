import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconSvg = readFileSync(join(root, "assets", "app-icon.svg"));
const badgeSvg = readFileSync(join(root, "assets", "app-icon-badge.svg"));
const notificationSvg = readFileSync(join(root, "assets", "notification-icon.svg"));
const outDir = join(root, "public", "icons");
const appDir = join(root, "src", "app");

/** Matches manifest background_color — prevents black rings on adaptive icons. */
const ICON_BG = { r: 37, g: 99, b: 235 };

/** Full-bleed opaque PWA icon (RGB, no alpha). */
async function renderAppIcon(size) {
  return sharp(iconSvg, { density: Math.max(256, size) })
    .resize(size, size, { fit: "fill" })
    .flatten({ background: ICON_BG })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/**
 * Notification badge: large white iB on fully transparent background.
 * Binarised alpha so Android does not render a grey "plate" behind the mark.
 */
async function renderNotificationBadge(size = 96) {
  const rendered = await sharp(badgeSvg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rendered;
  const out = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 48) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 255;
    } else {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    }
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Colour notification tray icon with enlarged mark. */
async function renderNotificationIcon(size = 192) {
  return sharp(notificationSvg, { density: Math.max(256, size) })
    .resize(size, size, { fit: "fill" })
    .flatten({ background: ICON_BG })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-192-maskable.png", 192],
  ["icon-512-maskable.png", 512],
];

for (const [filename, size] of targets) {
  const bytes = await renderAppIcon(size);
  writeFileSync(join(outDir, filename), bytes);
  console.log(`→ wrote public/icons/${filename} (${bytes.length} bytes)`);
}

const badge = await renderNotificationBadge(96);
writeFileSync(join(outDir, "badge.png"), badge);
console.log("→ wrote public/icons/badge.png");

const notificationIcon = await renderNotificationIcon(192);
writeFileSync(join(outDir, "notification-icon.png"), notificationIcon);
console.log("→ wrote public/icons/notification-icon.png");

const favicon = await renderAppIcon(32);
writeFileSync(join(appDir, "icon.png"), favicon);
console.log("→ wrote src/app/icon.png");

const appleIcon = await renderAppIcon(180);
writeFileSync(join(appDir, "apple-icon.png"), appleIcon);
console.log("→ wrote src/app/apple-icon.png");

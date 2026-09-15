import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(root, "assets", "app-icon-source.jpg");
const outDir = join(root, "public", "icons");
const appDir = join(root, "src", "app");

/** Centre-crop the portrait source to a square app icon buffer. */
async function loadSquareBuffer() {
  const meta = await sharp(sourcePath).metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.round((meta.width - side) / 2);
  const top = Math.round((meta.height - side) / 2);

  return sharp(sourcePath)
    .extract({ left, top, width: side, height: side })
    .png()
    .toBuffer();
}

async function renderAppIcon(size, maskable = false) {
  const square = await loadSquareBuffer();
  const source = sharp(square);

  if (!maskable) {
    return source.resize(size, size, { fit: "cover" }).png().toBuffer();
  }

  // Maskable: keep the mark inside Android's ~80% safe zone.
  const inner = Math.round(size * 0.8);
  const offset = Math.round((size - inner) / 2);
  const icon = await source.resize(inner, inner, { fit: "cover" }).png().toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 5, g: 8, b: 16, alpha: 1 },
    },
  })
    .composite([{ input: icon, left: offset, top: offset }])
    .png()
    .toBuffer();
}

/**
 * Notification badge: white iB silhouette on transparent background.
 * Extracts bright mark pixels from the source icon.
 */
async function renderNotificationBadge(size = 96) {
  const square = await loadSquareBuffer();
  const { data, info } = await sharp(square)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    // White body of the mark, cyan dot, and soft glow edges.
    const isMark = lum > 145 || (lum > 95 && sat > 0.25) || (lum > 80 && b > r + 20);
    if (isMark) {
      const alpha = Math.min(255, Math.round(Math.max(lum - 60, 40) * 1.4));
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = alpha;
    } else {
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
    }
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
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
  const bytes = await renderAppIcon(size, maskable);
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

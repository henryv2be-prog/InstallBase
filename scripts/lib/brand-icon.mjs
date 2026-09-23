import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = join(__dirname, "..", "..");

export const SOURCE_JPG = join(repoRoot, "assets", "brand", "app-icon-source.jpg");
export const MASTER_PNG = join(repoRoot, "assets", "brand", "app-icon-1024.png");

const GRADIENT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" ry="224" fill="url(#g)"/>
</svg>`;

function isBlue(r, g, b) {
  return b > r + 25 && b > 80;
}

function isCheckerboard(r, g, b) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  return spread < 22 && avg > 198 && avg < 232;
}

function isMarkPixel(r, g, b) {
  const isLetter = r > 248 && g > 248 && b > 248;
  const isCyan = g > 215 && b > 215 && r < 170;
  return (isLetter || isCyan) && !isBlue(r, g, b);
}

/** Detect the squircle bounds in the reference JPEG export. */
function detectIconBounds(data, width, height, channels) {
  function colBlue(x) {
    let n = 0;
    for (let y = 0; y < height; y++) {
      const i = (y * width + x) * channels;
      if (isBlue(data[i], data[i + 1], data[i + 2])) n++;
    }
    return n / height;
  }
  function rowBlue(y) {
    let n = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (isBlue(data[i], data[i + 1], data[i + 2])) n++;
    }
    return n / width;
  }

  let left = 0;
  let right = width - 1;
  let top = 0;
  let bottom = height - 1;
  while (left < width && colBlue(left) < 0.05) left++;
  while (right > left && colBlue(right) < 0.05) right--;
  while (top < height && rowBlue(top) < 0.05) top++;
  while (bottom > top && rowBlue(bottom) < 0.05) bottom--;

  const boxW = right - left + 1;
  const boxH = bottom - top + 1;
  const size = Math.max(boxW, boxH);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  return {
    left: Math.round(cx - size / 2),
    top: Math.round(cy - size / 2),
    size,
  };
}

/** Squircle from the reference export with checkerboard removed. */
async function extractSquirclePng(jpgPath) {
  const { data, info } = await sharp(jpgPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const { left, top, size } = detectIconBounds(data, width, height, channels);

  const cropped = await sharp(jpgPath)
    .extract({ left, top, width: size, height: size })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(cropped.data);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    if (isCheckerboard(r, g, b)) {
      out[i + 3] = 0;
    }
  }

  return sharp(out, {
    raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 },
  }).png();
}

/** Full app icon: reference squircle composited on the brand gradient canvas. */
export async function buildMasterIcon(jpgPath = SOURCE_JPG) {
  if (!existsSync(jpgPath)) {
    throw new Error(`Missing brand source image: ${jpgPath}`);
  }

  const squircle = await extractSquirclePng(jpgPath);
  const fgBuffer = await squircle.resize(1024, 1024).png().toBuffer();
  const bg = await sharp(Buffer.from(GRADIENT_SVG)).resize(1024, 1024).png().toBuffer();

  return sharp(bg).composite([{ input: fgBuffer, gravity: "center" }]).png();
}

export async function ensureMasterPng() {
  mkdirSync(dirname(MASTER_PNG), { recursive: true });
  const master = await buildMasterIcon();
  await master.toFile(MASTER_PNG);
  return MASTER_PNG;
}

/** White iB silhouette for Android notification badge. */
export async function buildNotificationBadge(size = 96) {
  const jpgPath = existsSync(SOURCE_JPG) ? SOURCE_JPG : null;
  if (!jpgPath) {
    throw new Error("Cannot build notification badge without app-icon-source.jpg");
  }

  const squircle = await extractSquirclePng(jpgPath);
  const { data, info } = await squircle.resize(512, 512).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = out[i + 3];
    if (a > 10 && isMarkPixel(r, g, b)) {
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = 255;
    } else {
      out[i + 3] = 0;
    }
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(size, size)
    .png()
    .toBuffer();
}

export async function resizeAppIcon(size) {
  const source = existsSync(MASTER_PNG) ? MASTER_PNG : await ensureMasterPng();
  return sharp(source).resize(size, size).png().toBuffer();
}

export function writePng(path, buffer) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
}

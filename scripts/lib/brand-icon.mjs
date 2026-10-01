import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  buildAppIconSvg,
  buildNotificationBadgeSvg,
} from "../../src/lib/brand-mark.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = join(__dirname, "..", "..");

export const MASTER_PNG = join(repoRoot, "assets", "brand", "app-icon-1024.png");

function oversampleFactor(size) {
  if (size <= 48) return 8;
  if (size <= 192) return 4;
  if (size <= 256) return 2;
  return 1;
}

async function rasterizeSvg(buildSvg, size) {
  const factor = oversampleFactor(size);
  const renderSize = size * factor;
  const svg = buildSvg(renderSize);
  return sharp(Buffer.from(svg))
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/** Master 1024px PNG from vector (no JPEG). */
export async function ensureMasterPng() {
  mkdirSync(dirname(MASTER_PNG), { recursive: true });
  const bytes = await rasterizeSvg(buildAppIconSvg, 1024);
  writeFileSync(MASTER_PNG, bytes);
  return MASTER_PNG;
}

export async function buildNotificationBadge(size = 96) {
  return rasterizeSvg(buildNotificationBadgeSvg, size);
}

export async function resizeAppIcon(size) {
  return rasterizeSvg(buildAppIconSvg, size);
}

export function writePng(path, buffer) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buffer);
}

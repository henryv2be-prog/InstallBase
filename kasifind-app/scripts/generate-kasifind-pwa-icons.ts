import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  buildKasiFindAppIconSvg,
  KF_APP_ICON_COLORS,
} from "../src/lib/kasifind/brand-app-icon";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");
mkdirSync(iconsDir, { recursive: true });

async function rasterize(svg: string, size: number) {
  const factor = size <= 64 ? 4 : size <= 256 ? 2 : 1;
  const render = size * factor;
  const scaled = svg.replace(/width="\d+" height="\d+"/, `width="${render}" height="${render}"`);
  return sharp(Buffer.from(scaled))
    .flatten({ background: KF_APP_ICON_COLORS.forest })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  writeFileSync(join(publicDir, "icon.svg"), buildKasiFindAppIconSvg(512, { gradientId: "kf-grad-svg" }));

  for (const size of [192, 512]) {
    const bytes = await rasterize(buildKasiFindAppIconSvg(size, { gradientId: `kf-grad-${size}` }), size);
    const out = join(iconsDir, `icon-${size}.png`);
    writeFileSync(out, bytes);
    console.log(`wrote icons/icon-${size}.png`);
  }

  for (const size of [192, 512]) {
    const bytes = await rasterize(
      buildKasiFindAppIconSvg(size, { maskable: true, gradientId: `kf-grad-mask-${size}` }),
      size
    );
    writeFileSync(join(iconsDir, `icon-${size}-maskable.png`), bytes);
    console.log(`wrote icons/icon-${size}-maskable.png`);
  }

  const standard512 = buildKasiFindAppIconSvg(512, { gradientId: "kf-grad-512" });
  writeFileSync(join(iconsDir, "apple-touch-icon.png"), await rasterize(standard512, 180));
  writeFileSync(join(iconsDir, "icon-32.png"), await rasterize(standard512, 32));

  console.log("KasiFind PWA icons generated.");
}

void main();

import { copyFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildNotificationBadge,
  ensureMasterPng,
  repoRoot,
  resizeAppIcon,
  writePng,
} from "./lib/brand-icon.mjs";

const outDir = join(repoRoot, "public", "icons");
const appDir = join(repoRoot, "src", "app");

await ensureMasterPng();
console.log("→ refreshed assets/brand/app-icon-1024.png from vector mark");

const sizes = [192, 512];

for (const size of sizes) {
  const filename = `icon-${size}.png`;
  const bytes = await resizeAppIcon(size);
  const outPath = join(outDir, filename);
  writePng(outPath, bytes);
  // Maskable must match exactly — Android launchers pick either; mismatches look broken.
  copyFileSync(outPath, join(outDir, `icon-${size}-maskable.png`));
  console.log(`→ wrote public/icons/${filename} + maskable (${bytes.length} bytes)`);
}

const badge = await buildNotificationBadge(96);
writePng(join(outDir, "badge.png"), badge);
console.log("→ wrote public/icons/badge.png");

for (const [size, name] of [
  [32, "icon.png"],
  [180, "apple-icon.png"],
]) {
  const bytes = await resizeAppIcon(size);
  writePng(join(appDir, name), bytes);
  console.log(`→ wrote src/app/${name} (${size}×${size})`);
}

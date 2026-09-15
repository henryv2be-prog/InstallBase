import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");

const { renderAppIcon, renderNotificationBadge } = await import(join(root, "src/lib/app-icon.tsx"));

const sizes = [192, 512];

mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const filename = `icon-${size}.png`;
  const response = renderAppIcon(size, false);
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(join(outDir, filename), bytes);
  // Maskable must match exactly — Android launchers pick either; mismatches look broken.
  copyFileSync(join(outDir, filename), join(outDir, `icon-${size}-maskable.png`));
  console.log(`→ wrote public/icons/${filename} + maskable (${bytes.length} bytes)`);
}

const badge = renderNotificationBadge(96);
writeFileSync(join(outDir, "badge.png"), Buffer.from(await badge.arrayBuffer()));
console.log("→ wrote public/icons/badge.png");

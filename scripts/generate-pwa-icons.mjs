import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");

// Load the compiled app-icon module via tsx-compatible dynamic import.
const { renderAppIcon, renderNotificationBadge } = await import(join(root, "src/lib/app-icon.tsx"));

const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-192-maskable.png", 192, true],
  ["icon-512-maskable.png", 512, true],
];

mkdirSync(outDir, { recursive: true });

for (const [filename, size, maskable] of targets) {
  const response = renderAppIcon(size, maskable);
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(join(outDir, filename), bytes);
  console.log(`→ wrote public/icons/${filename} (${bytes.length} bytes)`);
}

const badge = renderNotificationBadge(96);
writeFileSync(join(outDir, "badge.png"), Buffer.from(await badge.arrayBuffer()));
console.log("→ wrote public/icons/badge.png");

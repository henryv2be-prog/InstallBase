import path from "path";

/** Safe filename for a KasiFind `/uploads/<file>` path (no fs). */
export function uploadPathToFilename(url: string): string | null {
  if (!url.startsWith("/uploads/")) return null;
  const rest = url.slice("/uploads/".length);
  if (!rest || rest.includes("/") || rest.includes("..")) return null;
  return path.basename(rest);
}
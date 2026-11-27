import path from "path";

/** Collapse absolute site URLs back to `/uploads/...` for variant lookup. */
export function normalizeListingImageStoredPath(src: string): string {
  const trimmed = src.trim();
  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const pathname = new URL(trimmed).pathname;
    if (pathname.startsWith("/uploads/")) return pathname;
  } catch {
    /* ignore */
  }
  return trimmed;
}

/** Safe filename for a KasiFind `/uploads/<file>` path (no fs). */
export function uploadPathToFilename(url: string): string | null {
  const normalized = normalizeListingImageStoredPath(url);
  if (!normalized.startsWith("/uploads/")) return null;
  const rest = normalized.slice("/uploads/".length);
  if (!rest || rest.includes("/") || rest.includes("..")) return null;
  return path.basename(rest);
}
import { publicAssetUrl } from "@/lib/kasifind/public-asset-url";

/** Normalise listing image paths for `<img src>` (client or server). */
export function resolveListingImageSrc(src: string, origin?: string | null): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/")) {
    return publicAssetUrl(trimmed, origin ?? (typeof window !== "undefined" ? window.location.origin : null));
  }
  return trimmed;
}

/** Alternate URL to try when the first request fails (relative ↔ absolute). */
export function alternateListingImageSrc(current: string, original: string): string | null {
  const trimmed = original.trim();
  if (trimmed.startsWith("/") && current.startsWith("http")) {
    return trimmed;
  }
  if (trimmed.startsWith("http") && current === trimmed) {
    try {
      const u = new URL(trimmed);
      return u.pathname + u.search;
    } catch {
      return null;
    }
  }
  if (trimmed.startsWith("/") && typeof window !== "undefined") {
    const absolute = publicAssetUrl(trimmed, window.location.origin);
    if (absolute !== current) return absolute;
  }
  return null;
}

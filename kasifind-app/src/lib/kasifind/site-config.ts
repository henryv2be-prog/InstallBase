/**
 * Canonical public site origin for sitemaps, metadataBase, and absolute SEO URLs.
 * Prefers NEXT_PUBLIC_SITE_URL, then AUTH_URL, then https://RAILWAY_PUBLIC_DOMAIN.
 */
export function getConfiguredSiteOrigin(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL?.trim(),
    process.env.AUTH_URL?.trim(),
    process.env.RAILWAY_PUBLIC_DOMAIN?.trim()
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN.trim()}`
      : null,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    try {
      const url = new URL(normalized);
      return url.origin;
    } catch {
      continue;
    }
  }
  return null;
}

/** Paths included in the public sitemap (no trailing slashes). */
export const PUBLIC_SITEMAP_STATIC_PATHS = [
  "/",
  "/categories",
  "/locations",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/activity-map",
] as const;
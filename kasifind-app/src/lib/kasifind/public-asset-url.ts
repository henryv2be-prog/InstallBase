/** Turn `/uploads/...` paths into absolute URLs when a site origin is known. */
export function publicAssetUrl(path: string, siteOrigin?: string | null): string {
  if (!path.startsWith("/")) return path;
  const origin =
    siteOrigin?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    process.env.AUTH_URL?.replace(/\/$/, "");
  if (!origin) return path;
  return `${origin}${path}`;
}

export function siteOriginFromHeaders(headerStore: Headers): string | null {
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return null;
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host.split(",")[0]?.trim()}`;
}

/** Canonical app URL for links in emails and redirects. */
export function getAppUrl() {
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  const url =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    (railwayDomain ? `https://${railwayDomain}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

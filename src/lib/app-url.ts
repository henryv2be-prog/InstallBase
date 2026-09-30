/** Canonical app origin for links in emails and redirects (no path — avoids /feed/reset-password 404s). */
export function getAppUrl() {
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  const raw =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    (railwayDomain ? `https://${railwayDomain}` : "http://localhost:3000");

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return raw.replace(/\/$/, "");
  }
}

/** Canonical app URL for links in emails and redirects. */
export function getAppUrl() {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

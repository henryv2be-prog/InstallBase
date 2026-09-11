/** Hostname users should use for PWA install, auth, and push (no port). */
export function getCanonicalHost(): string | null {
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (authUrl) {
    try {
      return new URL(authUrl).hostname;
    } catch {
      /* fall through */
    }
  }

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  return railway || null;
}

/** Hostnames that should redirect to the canonical host (comma-separated env). */
export function getLegacyHosts(): string[] {
  const raw = process.env.LEGACY_HOSTS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function shouldRedirectToCanonicalHost(host: string): string | null {
  const canonical = getCanonicalHost()?.toLowerCase();
  if (!canonical) return null;

  const normalized = host.toLowerCase().split(":")[0];
  if (!normalized || normalized === canonical) return null;
  if (normalized === "localhost" || normalized === "127.0.0.1") return null;

  const legacy = getLegacyHosts();
  if (legacy.includes(normalized)) return canonical;

  // Railway custom domains can differ from RAILWAY_PUBLIC_DOMAIN — only force
  // redirect when the host is explicitly listed as legacy.
  return null;
}

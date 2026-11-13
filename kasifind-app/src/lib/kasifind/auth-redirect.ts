/** Safe internal return paths after provider sign-in (open-redirect safe). */

const BLOCKED_PREFIXES = ["/login", "/register"] as const;

export function sanitizeAuthNextPath(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("://")) return fallback;
  for (const blocked of BLOCKED_PREFIXES) {
    if (trimmed === blocked || trimmed.startsWith(`${blocked}/`) || trimmed.startsWith(`${blocked}?`)) {
      return fallback;
    }
  }
  return trimmed;
}

export function loginPathWithNext(destinationPath: string): string {
  const safe = sanitizeAuthNextPath(destinationPath, "/account/listing");
  return `/login?next=${encodeURIComponent(safe)}`;
}

export function registerPathWithNext(destinationPath: string): string {
  const safe = sanitizeAuthNextPath(destinationPath, "/account/listing");
  return `/register?next=${encodeURIComponent(safe)}`;
}

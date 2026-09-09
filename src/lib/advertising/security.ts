const BLOCKED_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

/** Validate advertiser destination URLs — blocks XSS and open redirects. */
export function sanitizeAdDestinationUrl(url: string, allowInternal = false): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (allowInternal && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (trimmed.includes("\\") || trimmed.includes("\0")) return null;
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (BLOCKED_PROTOCOLS.test(trimmed)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeAdText(text: string, maxLength = 500): string {
  return text
    .replace(/[<>`]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function isAllowedMediaUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/ads/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

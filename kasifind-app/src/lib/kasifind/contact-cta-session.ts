const STORAGE_PREFIX = "kf-contact-cta-v1:";

export function contactCtaSessionStorageKey(scopeKey: string): string {
  return `${STORAGE_PREFIX}${scopeKey}`;
}

export function serializeContactCtaMap(map: ReadonlyMap<string, string>): string {
  return JSON.stringify([...map.entries()]);
}

export function parseContactCtaSessionMap(
  raw: string,
  listingIds: readonly string[]
): Map<string, string> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  const map = new Map<string, string>();
  for (const entry of parsed) {
    if (!Array.isArray(entry) || entry.length !== 2) return null;
    const [id, phrase] = entry;
    if (typeof id !== "string" || typeof phrase !== "string") return null;
    map.set(id, phrase);
  }

  for (const id of listingIds) {
    if (!map.has(id)) return null;
  }
  if (map.size !== listingIds.length) return null;

  return map;
}

export function readContactCtaSessionMap(
  storageKey: string,
  listingIds: readonly string[]
): Map<string, string> | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    return parseContactCtaSessionMap(raw, listingIds);
  } catch {
    return null;
  }
}

export function writeContactCtaSessionMap(storageKey: string, map: ReadonlyMap<string, string>): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(storageKey, serializeContactCtaMap(map));
  } catch {
    /* ignore quota / privacy */
  }
}
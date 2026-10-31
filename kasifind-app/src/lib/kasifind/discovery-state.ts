/** Persist homepage discovery filters + location so back-from-listing restores context. */

const KEY = "kf_discovery_state_v2";

export type KfDiscoveryLocation = {
  mode: "gps" | "manual";
  lat: number;
  lng: number;
  label: string;
};

export type KfDiscoveryState = {
  query: string;
  radiusKm: number;
  categorySlug: string | null;
  location: KfDiscoveryLocation | null;
};

export function isValidDiscoveryLocation(value: unknown): value is KfDiscoveryLocation {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (o.mode !== "gps" && o.mode !== "manual") return false;
  if (typeof o.lat !== "number" || typeof o.lng !== "number") return false;
  if (!Number.isFinite(o.lat) || !Number.isFinite(o.lng)) return false;
  if (typeof o.label !== "string" || !o.label.trim()) return false;
  return true;
}

export function readDiscoveryState(): KfDiscoveryState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return readLegacyDiscoveryState();
    const parsed = JSON.parse(raw) as KfDiscoveryState;
    if (typeof parsed.query !== "string") return null;
    if (typeof parsed.radiusKm !== "number") return null;
    if (parsed.categorySlug !== null && typeof parsed.categorySlug !== "string") return null;
    if (parsed.location !== null && !isValidDiscoveryLocation(parsed.location)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** v1 had filters only — merge if present. */
function readLegacyDiscoveryState(): KfDiscoveryState | null {
  try {
    const raw = sessionStorage.getItem("kf_discovery_state_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      query?: string;
      radiusKm?: number;
      categorySlug?: string | null;
    };
    if (typeof parsed.query !== "string" || typeof parsed.radiusKm !== "number") return null;
    if (parsed.categorySlug !== null && typeof parsed.categorySlug !== "string") return null;
    return {
      query: parsed.query,
      radiusKm: parsed.radiusKm,
      categorySlug: parsed.categorySlug ?? null,
      location: null,
    };
  } catch {
    return null;
  }
}

export function writeDiscoveryState(state: KfDiscoveryState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

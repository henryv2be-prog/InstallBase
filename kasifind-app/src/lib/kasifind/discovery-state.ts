/** Persist homepage discovery filters so back-from-listing restores context. */

const KEY = "kf_discovery_state_v1";

export type KfDiscoveryState = {
  query: string;
  radiusKm: number;
  categorySlug: string | null;
};

export function readDiscoveryState(): KfDiscoveryState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KfDiscoveryState;
    if (typeof parsed.query !== "string") return null;
    if (typeof parsed.radiusKm !== "number") return null;
    if (parsed.categorySlug !== null && typeof parsed.categorySlug !== "string") return null;
    return parsed;
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

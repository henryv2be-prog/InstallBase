/** Persist homepage discovery filters + location so back-from-listing restores context. */

import { DISCOVERY_RADIUS_RINGS_KM } from "@/lib/kasifind/discovery-config";

const KEY_V3 = "kf_discovery_state_v3";
const KEY_V2 = "kf_discovery_state_v2";
/** Survives new tabs/sessions — anonymous users keep search area until they change it. */
const KEY_LOCATION_PERSIST = "kf_discovery_location_v1";

export type KfRadiusMode = "auto" | "fixed";

export type KfDiscoveryLocation =
  | { mode: "browse"; label: string }
  | { mode: "gps"; lat: number; lng: number; label: string }
  | { mode: "manual"; lat: number; lng: number; label: string };

export type KfDiscoveryState = {
  query: string;
  radiusKm: number;
  radiusMode: KfRadiusMode;
  categorySlug: string | null;
  location: KfDiscoveryLocation | null;
};

export function normalizeDiscoveryRadiusKm(km: number): number {
  if (DISCOVERY_RADIUS_RINGS_KM.includes(km as (typeof DISCOVERY_RADIUS_RINGS_KM)[number])) {
    return km;
  }
  if (km <= 7) return 5;
  if (km <= 20) return 15;
  if (km <= 40) return 30;
  return 50;
}

export function isValidDiscoveryLocation(value: unknown): value is KfDiscoveryLocation {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (o.mode !== "gps" && o.mode !== "manual" && o.mode !== "browse") return false;
  if (typeof o.label !== "string" || !o.label.trim()) return false;
  if (o.mode === "browse") return true;
  if (typeof o.lat !== "number" || typeof o.lng !== "number") return false;
  if (!Number.isFinite(o.lat) || !Number.isFinite(o.lng)) return false;
  return true;
}

function normalizeState(raw: Partial<KfDiscoveryState> | null): KfDiscoveryState | null {
  if (!raw || typeof raw.query !== "string") return null;
  if (typeof raw.radiusKm !== "number") return null;
  if (raw.categorySlug !== null && raw.categorySlug !== undefined && typeof raw.categorySlug !== "string") {
    return null;
  }
  if (raw.location !== null && raw.location !== undefined && !isValidDiscoveryLocation(raw.location)) {
    return null;
  }
  const radiusMode: KfRadiusMode = raw.radiusMode === "fixed" ? "fixed" : "auto";
  return {
    query: raw.query,
    radiusKm: normalizeDiscoveryRadiusKm(raw.radiusKm),
    radiusMode,
    categorySlug: raw.categorySlug ?? null,
    location: raw.location ?? null,
  };
}

export function readPersistedDiscoveryLocation(): KfDiscoveryLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_LOCATION_PERSIST);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidDiscoveryLocation(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedDiscoveryLocation(location: KfDiscoveryLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_LOCATION_PERSIST, JSON.stringify(location));
  } catch {
    /* ignore */
  }
}

export function readDiscoveryState(): KfDiscoveryState | null {
  if (typeof window === "undefined") return null;
  try {
    const rawV3 = sessionStorage.getItem(KEY_V3);
    if (rawV3) {
      const normalized = normalizeState(JSON.parse(rawV3) as Partial<KfDiscoveryState>);
      if (normalized && !normalized.location) {
        const persisted = readPersistedDiscoveryLocation();
        if (persisted) {
          return { ...normalized, location: persisted };
        }
      }
      return normalized;
    }
    const rawV2 = sessionStorage.getItem(KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Partial<KfDiscoveryState>;
      const normalized = normalizeState({
        ...parsed,
        radiusMode: parsed.radiusMode ?? "auto",
      });
      if (normalized && !normalized.location) {
        const persisted = readPersistedDiscoveryLocation();
        if (persisted) return { ...normalized, location: persisted };
      }
      return normalized;
    }
    const legacy = readLegacyDiscoveryState();
    if (legacy && !legacy.location) {
      const persisted = readPersistedDiscoveryLocation();
      if (persisted) return { ...legacy, location: persisted };
    }
    if (legacy) return legacy;

    const persisted = readPersistedDiscoveryLocation();
    if (persisted) {
      return {
        query: "",
        radiusKm: normalizeDiscoveryRadiusKm(5),
        radiusMode: "auto",
        categorySlug: null,
        location: persisted,
      };
    }
    return null;
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
    return normalizeState({
      query: parsed.query,
      radiusKm: parsed.radiusKm,
      radiusMode: "auto",
      categorySlug: parsed.categorySlug ?? null,
      location: null,
    });
  } catch {
    return null;
  }
}

export function writeDiscoveryState(state: KfDiscoveryState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      KEY_V3,
      JSON.stringify({
        ...state,
        radiusKm: normalizeDiscoveryRadiusKm(state.radiusKm),
      })
    );
    if (state.location) {
      writePersistedDiscoveryLocation(state.location);
    }
  } catch {
    /* ignore */
  }
}

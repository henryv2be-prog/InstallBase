import type { KfDiscoveryLocation, KfDiscoveryState } from "@/lib/kasifind/discovery-state";
import { readDiscoveryState } from "@/lib/kasifind/discovery-state";

export type NearbySearchPlan =
  | { mode: "browse"; searchUrl: string }
  | {
      mode: "geo";
      searchUrl: string;
      label: string;
    };

function visitorGeoLocation(
  location: KfDiscoveryLocation | null | undefined
): { lat: number; lng: number } | null {
  if (!location || location.mode === "browse") return null;
  return { lat: location.lat, lng: location.lng };
}

/** Build `/api/search` params from persisted visitor discovery (never auto-GPS). */
export function buildNearbyListingSearchUrl(
  categorySlug?: string | null,
  state?: KfDiscoveryState | null
): NearbySearchPlan {
  const saved = state ?? readDiscoveryState();
  const params = new URLSearchParams();
  params.set("q", "");
  params.set("limit", "12");
  if (categorySlug) params.set("category", categorySlug);

  const geo = visitorGeoLocation(saved?.location);
  if (!geo) {
    params.set("browse", "1");
    return { mode: "browse", searchUrl: `/api/search?${params}` };
  }

  const radiusKm = saved?.radiusKm ?? 5;
  const radiusMode = saved?.radiusMode ?? "auto";
  params.set("lat", String(geo.lat));
  params.set("lng", String(geo.lng));
  params.set("radiusKm", String(radiusKm));
  params.set("autoExpand", radiusMode === "auto" ? "1" : "0");

  const label =
    saved?.location?.mode === "gps" || saved?.location?.mode === "manual"
      ? saved.location.label
      : "Your area";

  return { mode: "geo", searchUrl: `/api/search?${params}`, label };
}

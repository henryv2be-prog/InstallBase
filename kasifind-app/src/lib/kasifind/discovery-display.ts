import { DISCOVERY_RADIUS_RINGS_KM } from "@/lib/kasifind/discovery-config";
import type { KfDiscoveryLocation, KfRadiusMode } from "@/lib/kasifind/discovery-state";

export const DISCOVERY_RADIUS_CHIPS_KM = DISCOVERY_RADIUS_RINGS_KM;

export type DiscoverySearchMeta = {
  browse?: boolean;
  radiusKm?: number;
  includesSurroundingAreas?: boolean;
  coverageExhausted?: boolean;
  localListingCount?: number;
};

export function locationModeLabel(location: KfDiscoveryLocation): string {
  if (location.mode === "browse") return "Browsing all areas";
  if (location.mode === "gps") return "Near me";
  return `Near ${location.label}`;
}

export function locationModeHint(location: KfDiscoveryLocation): string {
  if (location.mode === "browse") {
    return "Showing all listings nationwide — not sorted by distance.";
  }
  if (location.mode === "gps") {
    return "Using your current location for nearby results.";
  }
  return `Searching around ${location.label} — not live GPS.`;
}

export function formatDiscoveryResultsSubtitle(input: {
  location: KfDiscoveryLocation;
  radiusMode: KfRadiusMode;
  selectedRadiusKm: number;
  searchMeta: DiscoverySearchMeta | null;
}): { primary: string; secondary: string | null } {
  const { location, radiusMode, selectedRadiusKm, searchMeta } = input;

  if (location.mode === "browse") {
    return {
      primary: "Nationwide · sorted by relevance",
      secondary: null,
    };
  }

  const effectiveKm = searchMeta?.radiusKm ?? selectedRadiusKm;

  if (radiusMode === "auto") {
    if (searchMeta?.includesSurroundingAreas) {
      return {
        primary: `Closest first · up to ${effectiveKm} km including surrounding areas`,
        secondary:
          "Not many businesses very close by — we've included nearby communities too.",
      };
    }
    if (effectiveKm <= 5) {
      return {
        primary: "Closest first · within about 5 km",
        secondary: null,
      };
    }
    return {
      primary: `Closest first · within ${effectiveKm} km`,
      secondary: null,
    };
  }

  return {
    primary: `Within ${effectiveKm} km · closest first`,
    secondary:
      location.mode === "manual"
        ? `From your chosen area (${location.label}).`
        : null,
  };
}

export function radiusChipLabel(km: number | "auto"): string {
  if (km === "auto") return "Auto";
  return `${km} km`;
}

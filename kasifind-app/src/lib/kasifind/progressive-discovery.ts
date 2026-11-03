import {
  DISCOVERY_LOCAL_RADIUS_KM,
  DISCOVERY_MIN_LISTINGS_BEFORE_STOP,
  DISCOVERY_RADIUS_RINGS_KM,
} from "@/lib/kasifind/discovery-config";

export type ProgressiveDiscoveryPlan = {
  /** Outer edge of the search window (km). */
  outerRadiusKm: number;
  localRadiusKm: number;
  includesSurroundingAreas: boolean;
  /** Listings within the local (first) ring. */
  localListingCount: number;
  /** Listings within the chosen outer ring. */
  totalWithinOuter: number;
};

/**
 * Chooses how far to search given listing distances (km). Pure — used by search + tests.
 * Expands ring-by-ring while the cumulative count within the outer edge is below the minimum.
 */
export function planProgressiveDiscovery(
  distancesKm: number[],
  options?: {
    ringsKm?: readonly number[];
    minListings?: number;
  }
): ProgressiveDiscoveryPlan {
  const ringsKm = options?.ringsKm ?? DISCOVERY_RADIUS_RINGS_KM;
  const minListings = options?.minListings ?? DISCOVERY_MIN_LISTINGS_BEFORE_STOP;
  const localRadiusKm = ringsKm[0] ?? DISCOVERY_LOCAL_RADIUS_KM;

  const finite = distancesKm.filter((d) => Number.isFinite(d) && d >= 0);
  const localListingCount = finite.filter((d) => d <= localRadiusKm).length;

  let outerRadiusKm = localRadiusKm;
  for (const ring of ringsKm) {
    outerRadiusKm = ring;
    const totalWithinOuter = finite.filter((d) => d <= ring).length;
    if (totalWithinOuter >= minListings) {
      return {
        outerRadiusKm,
        localRadiusKm,
        includesSurroundingAreas: outerRadiusKm > localRadiusKm,
        localListingCount,
        totalWithinOuter,
      };
    }
  }

  const totalWithinOuter = finite.filter((d) => d <= outerRadiusKm).length;
  return {
    outerRadiusKm,
    localRadiusKm,
    includesSurroundingAreas: outerRadiusKm > localRadiusKm,
    localListingCount,
    totalWithinOuter,
  };
}

export function filterHitsWithinRadius<T extends { distanceKm: number }>(
  hits: T[],
  outerRadiusKm: number
): T[] {
  return hits.filter((h) => Number.isFinite(h.distanceKm) && h.distanceKm <= outerRadiusKm);
}

import {
  DISCOVERY_LOCAL_RADIUS_KM,
  DISCOVERY_MAX_RADIUS_KM,
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
 * Auto discovery: always return hits within the max ring (50 km), sorted closest-first by the caller.
 * Ring-walk only decides sparse-area messaging (`includesSurroundingAreas`), not the search cap.
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
  const outerRadiusKm = ringsKm[ringsKm.length - 1] ?? DISCOVERY_MAX_RADIUS_KM;

  const finite = distancesKm.filter((d) => Number.isFinite(d) && d >= 0);
  const localListingCount = finite.filter((d) => d <= localRadiusKm).length;
  const totalWithinOuter = finite.filter((d) => d <= outerRadiusKm).length;

  let sparseSatisfiedRing: number | null = null;
  for (const ring of ringsKm) {
    const within = finite.filter((d) => d <= ring).length;
    if (within >= minListings) {
      sparseSatisfiedRing = ring;
      break;
    }
  }

  const includesSurroundingAreas =
    localListingCount < minListings &&
    (sparseSatisfiedRing ?? outerRadiusKm) > localRadiusKm;

  return {
    outerRadiusKm,
    localRadiusKm,
    includesSurroundingAreas,
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

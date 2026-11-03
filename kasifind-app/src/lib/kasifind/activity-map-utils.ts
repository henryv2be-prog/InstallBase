/** Grid step in degrees — coarser when zoomed out. */
export function gridStepForZoom(zoom: number): number {
  const z = Math.round(zoom);
  if (z <= 6) return 1.2;
  if (z <= 7) return 0.6;
  if (z <= 8) return 0.35;
  if (z <= 9) return 0.2;
  if (z <= 10) return 0.12;
  if (z <= 11) return 0.07;
  return 0.04;
}

export function searchRadiusKmForGridStep(gridStep: number): number {
  const km = gridStep * 111 * 0.85;
  return Math.min(50, Math.max(8, Math.round(km)));
}

export const ACTIVITY_MAP_SA_BOUNDS = {
  minLat: -35.5,
  maxLat: -22,
  minLng: 16,
  maxLng: 33.5,
} as const;

export type ActivityMapCellAggregate = {
  id: string;
  centerLat: number;
  centerLng: number;
  count: number;
  areaHint: string;
};

function cellId(latIndex: number, lngIndex: number, gridStep: number): string {
  return `${gridStep}:${latIndex}:${lngIndex}`;
}

/** Mirrors former SQL bucketing — pure for tests and server aggregation. */
export function aggregateListingsToCells(
  listings: { latitude: number; longitude: number; locationLabel: string | null }[],
  gridStep: number
): ActivityMapCellAggregate[] {
  const { minLat, maxLat, minLng, maxLng } = ACTIVITY_MAP_SA_BOUNDS;
  type Bucket = {
    latIndex: number;
    lngIndex: number;
    count: number;
    areaHint: string;
  };
  const buckets = new Map<string, Bucket>();

  for (const listing of listings) {
    const { latitude, longitude } = listing;
    if (latitude < minLat || latitude > maxLat || longitude < minLng || longitude > maxLng) {
      continue;
    }

    const rlat = Math.round(latitude * 100) / 100;
    const rlng = Math.round(longitude * 100) / 100;
    const latIndex = Math.floor(rlat / gridStep);
    const lngIndex = Math.floor(rlng / gridStep);
    const key = `${latIndex}:${lngIndex}`;
    const label = listing.locationLabel?.trim() || "Local area";
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      if (label.localeCompare(existing.areaHint) < 0) existing.areaHint = label;
    } else {
      buckets.set(key, { latIndex, lngIndex, count: 1, areaHint: label });
    }
  }

  return [...buckets.values()].map((bucket) => ({
    id: cellId(bucket.latIndex, bucket.lngIndex, gridStep),
    centerLat: bucket.latIndex * gridStep + gridStep / 2,
    centerLng: bucket.lngIndex * gridStep + gridStep / 2,
    count: bucket.count,
    areaHint: bucket.areaHint,
  }));
}

import "server-only";
import {
  aggregateListingsToCells,
  gridStepForZoom,
  searchRadiusKmForGridStep,
} from "@/lib/kasifind/activity-map-utils";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export {
  aggregateListingsToCells,
  gridStepForZoom,
  searchRadiusKmForGridStep,
} from "@/lib/kasifind/activity-map-utils";

/** Published listings visible in public discovery (matches listing-count + search intent). */
export const ACTIVITY_MAP_LISTING_FILTER = {
  status: "PUBLISHED" as const,
  moderationStatus: "APPROVED" as const,
  user: { suspended: false },
};

export type ActivityMapCell = {
  id: string;
  centerLat: number;
  centerLng: number;
  count: number;
  areaHint: string;
};

export type ActivityMapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

async function queryActivityCells(gridStep: number): Promise<ActivityMapCell[]> {
  const kf = getKasiFindPrisma();
  const listings = await kf.kfProviderListing.findMany({
    where: ACTIVITY_MAP_LISTING_FILTER,
    select: {
      latitude: true,
      longitude: true,
      locationLabel: true,
    },
  });

  return aggregateListingsToCells(listings, gridStep);
}

/** Nationwide cells for current zoom (listing count is small — no viewport filter). */
export async function getActivityMapCells(options: {
  zoom: number;
  bounds?: ActivityMapBounds;
}): Promise<{ cells: ActivityMapCell[]; gridStep: number; searchRadiusKm: number }> {
  void options.bounds;
  if (!isKasiFindDbConfigured()) {
    return { cells: [], gridStep: 1, searchRadiusKm: 25 };
  }

  const gridStep = gridStepForZoom(options.zoom);
  const cells = await queryActivityCells(gridStep);
  return {
    cells,
    gridStep,
    searchRadiusKm: searchRadiusKmForGridStep(gridStep),
  };
}

export async function getActivityMapPublishedTotal(): Promise<number> {
  if (!isKasiFindDbConfigured()) return 0;
  const kf = getKasiFindPrisma();
  return kf.kfProviderListing.count({ where: ACTIVITY_MAP_LISTING_FILTER });
}

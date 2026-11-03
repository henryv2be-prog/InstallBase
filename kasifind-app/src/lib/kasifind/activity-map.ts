import "server-only";
import {
  gridStepForZoom,
  searchRadiusKmForGridStep,
} from "@/lib/kasifind/activity-map-utils";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";

export { gridStepForZoom, searchRadiusKmForGridStep } from "@/lib/kasifind/activity-map-utils";

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

function cellId(latIndex: number, lngIndex: number, gridStep: number): string {
  return `${gridStep}:${latIndex}:${lngIndex}`;
}

async function queryActivityCells(gridStep: number): Promise<ActivityMapCell[]> {
  const kf = getKasiFindPrisma();

  type Row = {
    center_lat: number;
    center_lng: number;
    count: number;
    area_hint: string | null;
    lat_index: number;
    lng_index: number;
  };

  const rows = await kf.$queryRaw<Row[]>`
    WITH points AS (
      SELECT
        ROUND(CAST(l.latitude AS numeric), 2)::float8 AS rlat,
        ROUND(CAST(l.longitude AS numeric), 2)::float8 AS rlng,
        l."locationLabel" AS label
      FROM "KfProviderListing" l
      INNER JOIN "KfUser" u ON u.id = l."userId"
      WHERE l.status = 'PUBLISHED'::"KfListingStatus"
        AND l."moderationStatus" = 'APPROVED'::"KfModerationStatus"
        AND u.suspended = false
        AND l.latitude >= ${-35.5}
        AND l.latitude <= ${-22}
        AND l.longitude >= ${16}
        AND l.longitude <= ${33.5}
    )
    SELECT
      (FLOOR(rlat / ${gridStep}) * ${gridStep} + ${gridStep} / 2.0)::float8 AS center_lat,
      (FLOOR(rlng / ${gridStep}) * ${gridStep} + ${gridStep} / 2.0)::float8 AS center_lng,
      COUNT(*)::int AS count,
      MIN(label) AS area_hint,
      FLOOR(rlat / ${gridStep})::int AS lat_index,
      FLOOR(rlng / ${gridStep})::int AS lng_index
    FROM points
    GROUP BY FLOOR(rlat / ${gridStep}), FLOOR(rlng / ${gridStep})
  `;

  return rows.map((row) => ({
    id: cellId(row.lat_index, row.lng_index, gridStep),
    centerLat: row.center_lat,
    centerLng: row.center_lng,
    count: row.count,
    areaHint: row.area_hint?.trim() || "Local area",
  }));
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

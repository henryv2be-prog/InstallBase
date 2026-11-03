import { NextRequest } from "next/server";
import { getActivityMapCells, getActivityMapPublishedTotal } from "@/lib/kasifind/activity-map";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { parseCoordinate } from "@/lib/kasifind/geo";
import { ACTIVITY_MAP_SA_BOUNDS } from "@/lib/kasifind/activity-map-utils";

export const dynamic = "force-dynamic";

const SA_BOUNDS_FALLBACK = {
  north: ACTIVITY_MAP_SA_BOUNDS.maxLat,
  south: ACTIVITY_MAP_SA_BOUNDS.minLat,
  east: ACTIVITY_MAP_SA_BOUNDS.maxLng,
  west: ACTIVITY_MAP_SA_BOUNDS.minLng,
};

function parseBounds(searchParams: URLSearchParams) {
  const north = parseCoordinate(searchParams.get("north"));
  const south = parseCoordinate(searchParams.get("south"));
  const east = parseCoordinate(searchParams.get("east"));
  const west = parseCoordinate(searchParams.get("west"));
  if (north === null || south === null || east === null || west === null) return null;
  if (north <= south || east <= west) return null;
  return { north, south, east, west };
}

export async function GET(request: NextRequest) {
  if (!isKasiFindDbConfigured()) {
    return Response.json({ error: "KasiFind is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const zoom = Number.parseInt(searchParams.get("zoom") ?? "6", 10);
  const bounds = parseBounds(searchParams) ?? SA_BOUNDS_FALLBACK;

  try {
    const [payload, totalPublished] = await Promise.all([
      getActivityMapCells({ zoom: Number.isFinite(zoom) ? zoom : 6, bounds }),
      getActivityMapPublishedTotal(),
    ]);

    return Response.json({
      ...payload,
      totalPublished,
      coverageNote:
        "Each hotspot shows aggregated published business listings — not live customer activity.",
    });
  } catch (error) {
    console.error("[kasifind] activity-map cells failed:", error);
    return Response.json({ error: "Could not load activity map." }, { status: 500 });
  }
}

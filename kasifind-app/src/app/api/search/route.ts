import { NextRequest } from "next/server";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { parseCoordinate, parseRadiusKm, isValidSaCoordinate } from "@/lib/kasifind/geo";
import {
  normalizeSearchResultLimit,
  searchProvidersBrowse,
  searchWithProgressiveFallback,
} from "@/lib/kasifind/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isKasiFindDbConfigured()) {
    return Response.json({ error: "KasiFind is not configured on this server." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const browse = searchParams.get("browse") === "1";
  const lat = parseCoordinate(searchParams.get("lat"));
  const lng = parseCoordinate(searchParams.get("lng"));
  const radiusKm = parseRadiusKm(searchParams.get("radiusKm"));
  const categorySlug = searchParams.get("category")?.trim() || null;
  const autoExpand = searchParams.get("autoExpand") !== "0";
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);

  if (browse) {
    try {
      const payload = await searchProvidersBrowse({
        query,
        categorySlug,
        limit: normalizeSearchResultLimit(
          Number.isFinite(limitParam) ? limitParam : undefined,
          "browse"
        ),
      });
      return Response.json({
        query,
        browse: true,
        radiusKm: 0,
        expanded: false,
        resultLimit: payload.results.length,
        results: payload.results,
      });
    } catch (error) {
      console.error("[kasifind] browse search failed:", error);
      return Response.json({ error: "Search failed. Try again." }, { status: 500 });
    }
  }

  if (lat === null || lng === null || !isValidSaCoordinate(lat, lng)) {
    return Response.json(
      { error: "Valid location coordinates are required.", code: "location_required" },
      { status: 400 }
    );
  }

  try {
    if (autoExpand) {
      const payload = await searchWithProgressiveFallback({
        query,
        center: { latitude: lat, longitude: lng },
        categorySlug,
        limit: normalizeSearchResultLimit(
          Number.isFinite(limitParam) ? limitParam : undefined,
          "geo"
        ),
      });
      return Response.json({
        query,
        center: { latitude: lat, longitude: lng },
        radiusKm: payload.radiusKm,
        expanded: payload.expanded,
        includesSurroundingAreas: payload.includesSurroundingAreas,
        localListingCount: payload.localListingCount,
        coverageExhausted: payload.coverageExhausted,
        results: payload.results,
      });
    }

    const payload = await (
      await import("@/lib/kasifind/search")
    ).searchProviders({
      query,
      center: { latitude: lat, longitude: lng },
      radiusKm,
      categorySlug,
      limit: normalizeSearchResultLimit(
        Number.isFinite(limitParam) ? limitParam : undefined,
        "geo"
      ),
    });

    return Response.json({
      query,
      center: { latitude: lat, longitude: lng },
      radiusKm: payload.radiusKm,
      expanded: payload.expanded,
      results: payload.results,
    });
  } catch (error) {
    console.error("[kasifind] search failed:", error);
    return Response.json({ error: "Search failed. Try again." }, { status: 500 });
  }
}

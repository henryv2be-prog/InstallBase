import "server-only";
import {
  mapNominatimRow,
  normalizeGeocodeQuery,
  type GeocodeHit,
} from "@/lib/kasifind/geocode-utils";

export type { GeocodeHit } from "@/lib/kasifind/geocode-utils";
export { normalizeGeocodeQuery, mapNominatimRow } from "@/lib/kasifind/geocode-utils";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export async function searchPlacesInSouthAfrica(query: string): Promise<GeocodeHit[]> {
  const q = normalizeGeocodeQuery(query);
  if (q.length < 2) return [];

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "za");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "KasiFind/1.0 (local business discovery; contact: support@kasifind.local)",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Geocoder responded with ${res.status}`);
  }

  const rows = (await res.json()) as Parameters<typeof mapNominatimRow>[0][];
  if (!Array.isArray(rows)) return [];

  const hits: GeocodeHit[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const hit = mapNominatimRow(row);
    if (!hit || seen.has(hit.placeId)) continue;
    seen.add(hit.placeId);
    hits.push(hit);
  }
  return hits;
}

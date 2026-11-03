import { NextRequest } from "next/server";
import { normalizeGeocodeQuery, searchPlacesInSouthAfrica } from "@/lib/kasifind/geocode";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = normalizeGeocodeQuery(new URL(request.url).searchParams.get("q") ?? "");
  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  try {
    const results = await searchPlacesInSouthAfrica(q);
    return Response.json({ query: q, results });
  } catch (error) {
    console.error("[kasifind] geocode failed:", error);
    return Response.json({ error: "Could not search places. Try again in a moment." }, { status: 502 });
  }
}

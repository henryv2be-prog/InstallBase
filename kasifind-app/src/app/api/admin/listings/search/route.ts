import { NextResponse } from "next/server";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { searchListingsForProviderReport } from "@/lib/kasifind/provider-performance-metrics";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

export async function GET(request: Request) {
  if (!isKasiFindDbConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ listings: [] });
  }

  const listings = await searchListingsForProviderReport(q);
  return NextResponse.json({ listings });
}

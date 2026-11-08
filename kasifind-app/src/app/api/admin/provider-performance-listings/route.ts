import { NextResponse } from "next/server";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getProviderReportListingsPage } from "@/lib/kasifind/provider-performance-listings";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

export async function GET(request: Request) {
  if (!isKasiFindDbConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const q = params.get("q")?.trim() ?? "";

  const data = await getProviderReportListingsPage({
    page: Number.isFinite(page) ? page : 1,
    q: q || undefined,
  });

  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getProviderPerformanceReportMetrics } from "@/lib/kasifind/provider-performance-metrics";
import { getProviderListingWhatsAppPhone } from "@/lib/kasifind/provider-performance-listings";
import {
  providerReportGeneratedStamp,
  resolveProviderReportPeriod,
  type ProviderReportPeriodPreset,
} from "@/lib/kasifind/provider-performance-report-period";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";

function parsePreset(value: string | null): ProviderReportPeriodPreset | null {
  if (value === "7d" || value === "30d" || value === "all" || value === "custom") return value;
  return null;
}

export async function GET(request: Request) {
  if (!isKasiFindDbConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const listingId = params.get("listingId")?.trim() ?? "";
  const preset = parsePreset(params.get("period"));
  const customStart = params.get("from");
  const customEnd = params.get("to");

  if (!listingId || !preset) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const period = resolveProviderReportPeriod({
    preset,
    customStart,
    customEnd,
  });
  if ("error" in period) {
    return NextResponse.json({ error: period.error }, { status: 400 });
  }

  const metrics = await getProviderPerformanceReportMetrics(listingId, period);
  if (!metrics) {
    return NextResponse.json({ error: "listing_not_found" }, { status: 404 });
  }

  const whatsAppPhone = await getProviderListingWhatsAppPhone(listingId);

  return NextResponse.json({
    metrics,
    generatedAtLabel: providerReportGeneratedStamp(),
    timeZone: "Africa/Johannesburg",
    whatsAppPhone,
  });
}

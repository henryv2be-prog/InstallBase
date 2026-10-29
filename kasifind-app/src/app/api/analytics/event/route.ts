import { NextResponse } from "next/server";
import { KfAnalyticsEventType } from "@/generated/prisma/enums";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { recordAnalyticsEvent, readVisitorIdFromCookies } from "@/lib/kasifind/analytics";

const ALLOWED = new Set<string>(Object.values(KfAnalyticsEventType));

type Body = {
  eventType?: string;
  listingId?: string;
  categoryId?: string;
  query?: string;
  regionLabel?: string;
};

export async function POST(request: Request) {
  if (!isKasiFindDbConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const eventType = body.eventType?.trim();
  if (!eventType || !ALLOWED.has(eventType)) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const visitorId = await readVisitorIdFromCookies();

  try {
    await recordAnalyticsEvent({
      eventType: eventType as KfAnalyticsEventType,
      listingId: body.listingId?.trim() || null,
      categoryId: body.categoryId?.trim() || null,
      query: body.query?.trim() || null,
      regionLabel: body.regionLabel?.trim() || null,
      visitorId,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

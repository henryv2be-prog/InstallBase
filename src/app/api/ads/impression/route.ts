import { NextResponse } from "next/server";
import { recordAdEvent } from "@/lib/advertising/analytics";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { advertisementId, placementKey, viewerKey, deviceType } = body;

    if (!advertisementId || !placementKey) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await recordAdEvent({
      advertisementId,
      placementKey,
      eventType: "IMPRESSION",
      viewerKey: typeof viewerKey === "string" ? viewerKey : undefined,
      deviceType: typeof deviceType === "string" ? deviceType : undefined,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to record impression" }, { status: 500 });
  }
}

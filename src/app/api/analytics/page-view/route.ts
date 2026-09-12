import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics/page-views";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageKey, viewerKey, deviceType } = body;

    if (!pageKey || typeof pageKey !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await recordPageView({
      pageKey,
      viewerKey: typeof viewerKey === "string" ? viewerKey : undefined,
      deviceType: typeof deviceType === "string" ? deviceType : undefined,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to record page view" }, { status: 500 });
  }
}

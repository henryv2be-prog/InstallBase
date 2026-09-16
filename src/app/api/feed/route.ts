import { NextResponse } from "next/server";
import { decodeFeedCursor } from "@/lib/feed-pagination";
import { getFollowingFeedPage, getPopularFeedPage } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") === "following" ? "following" : "popular";
  const cursor = decodeFeedCursor(searchParams.get("cursor"));
  const session = await getSession();
  const userId = session?.user?.id;

  if (tab === "following") {
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const page = await getFollowingFeedPage(userId, undefined, cursor);
    return NextResponse.json(page, {
      headers: { "Cache-Control": "private, no-cache" },
    });
  }

  const page = await getPopularFeedPage(userId, undefined, cursor);
  return NextResponse.json(page, {
    headers: { "Cache-Control": "private, no-cache" },
  });
}

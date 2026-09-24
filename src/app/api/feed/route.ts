import { NextResponse } from "next/server";
import { decodeFeedCursor, FEED_PAGE_SIZE } from "@/lib/feed-pagination";
import {
  getFollowingFeedPage,
  getPopularFeedPage,
  getTrendingFeedPage,
} from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tabParam = searchParams.get("tab");
  const tab =
    tabParam === "following" ? "following" : tabParam === "explore" ? "explore" : "popular";
  const cursor = decodeFeedCursor(searchParams.get("cursor"));
  const immersiveOnly = searchParams.get("immersive") === "1";
  const feedOptions = immersiveOnly ? { immersiveOnly: true as const } : undefined;
  const session = await getSession();
  const userId = session?.user?.id;

  if (tab === "explore") {
    const page = await getTrendingFeedPage(userId, undefined, cursor, feedOptions);
    return NextResponse.json(page, {
      headers: { "Cache-Control": "private, no-cache" },
    });
  }

  if (tab === "following") {
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const page = await getFollowingFeedPage(userId, FEED_PAGE_SIZE, cursor, feedOptions);
    return NextResponse.json(page, {
      headers: { "Cache-Control": "private, no-cache" },
    });
  }

  const page = await getPopularFeedPage(userId, undefined, cursor, feedOptions);
  return NextResponse.json(page, {
    headers: { "Cache-Control": "private, no-cache" },
  });
}

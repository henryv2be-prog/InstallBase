import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getFollowingFeedPage,
  getFollowingIds,
  getPopularFeedPage,
} from "@/lib/queries";
import { ImmersiveFeed } from "@/components/feed/immersive/immersive-feed";
import { cn } from "@/lib/utils";
import { GuestJoinCard } from "@/components/auth/guest-cta";

export const metadata = { title: "Watch installs" };
export const dynamic = "force-dynamic";

interface WatchFeedPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function WatchFeedPage({ searchParams }: WatchFeedPageProps) {
  const session = await getSession();
  const { tab } = await searchParams;
  const userId = session?.user?.id;

  const followingIds = userId ? await getFollowingIds(userId) : [];
  const followingSet = userId ? new Set(followingIds) : undefined;
  const followingTab =
    tab === "following" || (tab !== "popular" && !!userId && followingIds.length > 0);

  const feedPage =
    followingTab && userId
      ? await getFollowingFeedPage(userId)
      : await getPopularFeedPage(userId);
  const { posts, nextCursor, hasMore } = feedPage;

  return (
    <div className="immersive-feed-root -mx-3 flex flex-col sm:-mx-4 lg:mx-auto lg:max-w-6xl lg:flex-row lg:gap-6 xl:-mx-0">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 lg:hidden">
        <Link href="/feed" className="text-sm font-medium text-muted hover:text-foreground">
          Classic feed
        </Link>
        <div className="flex rounded-lg bg-card/80 p-0.5 text-xs font-semibold border border-border">
          <Link
            href="/feed/watch?tab=popular"
            className={cn(
              "rounded-md px-3 py-1.5",
              !followingTab ? "bg-card text-foreground shadow-sm" : "text-muted"
            )}
          >
            Popular
          </Link>
          {userId ? (
            <Link
              href="/feed/watch?tab=following"
              className={cn(
                "rounded-md px-3 py-1.5",
                followingTab ? "bg-card text-foreground shadow-sm" : "text-muted"
              )}
            >
              Following
            </Link>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 flex-1 lg:max-w-md xl:max-w-lg">
        {!userId && followingTab ? (
          <GuestJoinCard
            title="Follow installers to build this feed"
            body="Join to follow people and watch their installs here."
            next="/feed/watch?tab=following"
          />
        ) : (
          <ImmersiveFeed
            initialPosts={posts}
            initialCursor={nextCursor}
            initialHasMore={hasMore}
            tab={followingTab ? "following" : "popular"}
            currentUserId={userId}
            followingIds={followingSet}
          />
        )}
      </div>

      <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
        <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card/60 p-5">
          <h2 className="text-lg font-semibold">Watch installs</h2>
          <p className="text-sm text-muted">
            Scroll vertically through real installation work. Brag, comment, and follow without leaving the feed.
          </p>
          <Link href="/feed" className="text-sm font-medium text-primary hover:underline">
            Switch to classic feed
          </Link>
          <div className="flex rounded-xl bg-card/80 p-1 border border-border">
            <Link
              href="/feed/watch?tab=popular"
              className={cn(
                "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
                !followingTab ? "bg-card shadow-sm" : "text-muted"
              )}
            >
              Popular
            </Link>
            {userId ? (
              <Link
                href="/feed/watch?tab=following"
                className={cn(
                  "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
                  followingTab ? "bg-card shadow-sm" : "text-muted"
                )}
              >
                Following
              </Link>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}

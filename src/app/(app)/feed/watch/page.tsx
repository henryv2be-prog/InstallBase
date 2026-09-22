import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getFollowingFeedPage,
  getFollowingIds,
  getPopularFeedPage,
} from "@/lib/queries";
import { ImmersiveFeedWithAds } from "@/components/feed/immersive/immersive-feed-with-ads";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";
import { cn } from "@/lib/utils";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { WatchInstallsPromoSeenOnMount } from "@/components/feed/watch-installs-promo";
import { classicFeedHref } from "@/lib/feed-routes";

export const metadata = { title: "New look" };
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

  const classicHref = classicFeedHref(followingTab ? "following" : "popular");

  return (
    <div className="immersive-feed-root flex w-full max-w-full flex-col overflow-hidden max-lg:min-h-0 max-lg:flex-1 lg:mx-auto lg:max-w-6xl lg:flex-row lg:gap-6">
      <WatchInstallsPromoSeenOnMount />
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-2 overflow-visible px-3 py-2 lg:hidden">
        <Link
          href={classicHref}
          className="shrink-0 py-1 text-sm font-medium leading-none text-muted hover:text-foreground"
        >
          Classic feed
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-semibold text-foreground/90">New look</span>
          <div className="flex shrink-0 rounded-lg border border-border bg-card/80 p-1 text-xs font-semibold shadow-sm">
            <Link
              href="/feed/watch?tab=popular"
              className={cn(
                "inline-flex min-h-9 items-center rounded-md px-3 py-2 leading-none",
                !followingTab ? "bg-card text-foreground shadow-sm" : "text-muted"
              )}
            >
              Popular
            </Link>
            {userId ? (
              <Link
                href="/feed/watch?tab=following"
                className={cn(
                  "inline-flex min-h-9 items-center rounded-md px-3 py-2 leading-none",
                  followingTab ? "bg-card text-foreground shadow-sm" : "text-muted"
                )}
              >
                Following
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 min-w-0 w-full flex-1 max-lg:max-w-none lg:max-w-md xl:max-w-lg">
        {!userId && followingTab ? (
          <GuestJoinCard
            title="Follow installers to build this feed"
            body="Join to follow people and watch their installs here."
            next="/feed/watch?tab=following"
          />
        ) : (
          <ImmersiveFeedWithAds
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
          <h2 className="text-lg font-semibold">New look</h2>
          <p className="text-sm text-muted">
            Scroll vertically through real installation work. Brag, comment, and follow without leaving the feed.
          </p>
          <Link href={classicHref} className="text-sm font-medium text-primary hover:underline">
            Switch to classic feed
          </Link>
          <AdSlot placement={AD_PLACEMENTS.FEED_SIDEBAR} className="mt-2" />
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

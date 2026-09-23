import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getFollowingFeedPage,
  getFollowingIds,
  getPopularFeedPage,
} from "@/lib/queries";
import { ImmersiveFeedWithAds } from "@/components/feed/immersive/immersive-feed-with-ads";
import { cn } from "@/lib/utils";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { WatchInstallsPromoSeenOnMount } from "@/components/feed/watch-installs-promo";
import { classicFeedHref } from "@/lib/feed-routes";
import { WatchFeedMobileChrome } from "@/components/feed/immersive/watch-feed-mobile-chrome";

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

      <div className="immersive-feed-column relative min-h-0 min-w-0 w-full flex-1 max-lg:max-w-none lg:max-w-md xl:max-w-lg">
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
            followingIds={userId ? followingIds : undefined}
          />
        )}
        <WatchFeedMobileChrome
          followingTab={followingTab}
          userId={userId}
          classicHref={classicHref}
        />
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

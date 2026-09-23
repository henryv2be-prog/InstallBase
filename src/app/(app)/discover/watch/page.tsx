import Link from "next/link";
import { getSession } from "@/lib/session";
import { getFollowingIds, getTrendingFeedPage } from "@/lib/queries";
import { ImmersiveFeedWithAds } from "@/components/feed/immersive/immersive-feed-with-ads";
import { classicExploreHref } from "@/lib/discover-routes";

export const metadata = { title: "Explore" };
export const dynamic = "force-dynamic";

export default async function DiscoverWatchPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  const followingIds = userId ? await getFollowingIds(userId) : [];
  const { posts, nextCursor, hasMore } = await getTrendingFeedPage(userId);
  const classicHref = classicExploreHref("trending");

  return (
    <div className="immersive-feed-root flex w-full max-w-full flex-col overflow-hidden max-lg:min-h-0 max-lg:flex-1 lg:mx-auto lg:max-w-6xl lg:flex-row lg:gap-6">
      <div className="immersive-watch-top-chrome shrink-0 px-3 pb-2 pt-1 lg:hidden">
        <div className="mobile-nav-glass-dock flex min-h-[2.875rem] items-center justify-between gap-2 rounded-2xl p-1.5">
          <Link
            href={classicHref}
            className="shrink-0 rounded-xl px-2.5 py-2 text-sm font-medium leading-none text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            Classic explore
          </Link>
          <span className="text-xs font-semibold text-white/90">Trending · New look</span>
        </div>
      </div>

      <div className="immersive-feed-column min-h-0 min-w-0 w-full flex-1 max-lg:max-w-none lg:max-w-md xl:max-w-lg">
        <ImmersiveFeedWithAds
          initialPosts={posts}
          initialCursor={nextCursor}
          initialHasMore={hasMore}
          tab="explore"
          currentUserId={userId}
          followingIds={userId ? followingIds : undefined}
        />
      </div>

      <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
        <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card/60 p-5">
          <h2 className="text-lg font-semibold">Explore</h2>
          <p className="text-sm text-muted">
            Trending installs ranked by brags and engagement. Swipe vertically like Home.
          </p>
          <Link href={classicHref} className="text-sm font-medium text-primary hover:underline">
            Switch to classic explore
          </Link>
        </div>
      </aside>
    </div>
  );
}

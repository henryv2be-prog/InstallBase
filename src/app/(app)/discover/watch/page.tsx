import Link from "next/link";
import { getSession } from "@/lib/session";
import { getTrendingFeedPage } from "@/lib/queries";
import { ImmersiveFeedWithAds } from "@/components/feed/immersive/immersive-feed-with-ads";
import { classicExploreHref } from "@/lib/discover-routes";

export const metadata = { title: "Explore" };
export const dynamic = "force-dynamic";

export default async function DiscoverWatchPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  const { posts, nextCursor, hasMore } = await getTrendingFeedPage(userId);
  const classicHref = classicExploreHref("trending");

  return (
    <div className="immersive-feed-root flex w-full max-w-full flex-col overflow-hidden max-lg:min-h-0 max-lg:flex-1 lg:mx-auto lg:max-w-6xl lg:flex-row lg:gap-6">
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-2 px-3 py-2 lg:hidden">
        <Link
          href={classicHref}
          className="shrink-0 py-1 text-sm font-medium leading-none text-muted hover:text-foreground"
        >
          Classic explore
        </Link>
        <span className="text-xs font-semibold text-foreground/90">Trending · New look</span>
      </div>

      <div className="immersive-feed-column min-h-0 min-w-0 w-full flex-1 max-lg:max-w-none lg:max-w-md xl:max-w-lg">
        <ImmersiveFeedWithAds
          initialPosts={posts}
          initialCursor={nextCursor}
          initialHasMore={hasMore}
          tab="explore"
          currentUserId={userId}
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

import { auth } from "@/lib/auth";
import { getFeedPosts, getFollowingFeedPosts, getFollowingIds } from "@/lib/queries";
import { CreatePostCard } from "@/components/feed/create-post";
import { PostFeed } from "@/components/feed/post-card";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { BragTooltip } from "@/components/feed/brag-tooltip";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { FollowSuggestions } from "@/components/onboarding/follow-suggestions";
import { PullToRefresh } from "@/components/feed/pull-to-refresh";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Feed" };
export const dynamic = "force-dynamic";

interface FeedPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await auth();
  const { tab } = await searchParams;
  const userId = session?.user?.id;

  const followingPosts = userId ? await getFollowingFeedPosts(userId) : [];
  const followingIds = userId ? new Set(await getFollowingIds(userId)) : undefined;
  const followingTab =
    tab === "following" || (tab !== "popular" && !!userId && followingPosts.length > 0);

  const posts = followingTab && userId ? followingPosts : await getFeedPosts(userId);

  return (
    <PullToRefresh>
      <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
        {userId ? <WelcomeModal /> : null}
        {userId ? <BragTooltip /> : null}

        {userId ? (
          <CreatePostCard
            userName={session?.user?.name}
            userImage={session?.user?.image}
            compact
          />
        ) : (
          <GuestJoinCard
            title="See what installers are building"
            body="Browse the live feed as a guest. Join free to post photos, give brag points, and message people."
            next="/feed"
          />
        )}

        {userId && followingPosts.length === 0 ? <FollowSuggestions userId={userId} /> : null}

        <div>
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <Link
              href="/feed?tab=popular"
              className={cn(
                "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
                !followingTab
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-500"
              )}
            >
              Popular
            </Link>
            {userId ? (
              <Link
                href="/feed?tab=following"
                className={cn(
                  "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
                  followingTab
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                    : "text-gray-500"
                )}
              >
                Following
              </Link>
            ) : (
              <span
                className="flex-1 cursor-not-allowed rounded-lg py-2 text-center text-sm font-semibold text-gray-400"
                title="Join to follow installers"
              >
                Following
              </span>
            )}
          </div>
          {!followingTab && (
            <p className="mt-2 text-center text-xs text-muted">
              Ranked by recency, engagement, and installs from people you follow
            </p>
          )}
        </div>

        {followingTab && !userId ? (
          <GuestJoinCard
            title="Follow installers to build this feed"
            body="Join or log in to follow people and see their installs here."
            next="/feed?tab=following"
          />
        ) : followingTab && posts.length === 0 ? (
          <GuestJoinCard
            title="No posts from people you follow"
            body="Follow installers to see their work here."
            next="/feed?tab=following"
          />
        ) : (
          <PostFeed
            posts={posts}
            currentUserId={userId}
            showInlineComments
            feedContext={followingTab ? "following" : "popular"}
            followingIds={followingIds}
          />
        )}
      </div>
    </PullToRefresh>
  );
}

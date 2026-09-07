import { getSession } from "@/lib/session";
import { getFeedPosts, getFollowingFeedPosts, getFollowingIds } from "@/lib/queries";
import { CreatePostCard } from "@/components/feed/create-post";
import { PostFeed } from "@/components/feed/post-card";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { BragTooltip } from "@/components/feed/brag-tooltip";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { FollowSuggestions } from "@/components/onboarding/follow-suggestions";
import { PullToRefresh } from "@/components/feed/pull-to-refresh";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Feed" };
export const dynamic = "force-dynamic";

interface FeedPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getSession();
  const { tab } = await searchParams;
  const userId = session?.user?.id;

  const followingIds = userId ? await getFollowingIds(userId) : [];
  const followingSet = userId ? new Set(followingIds) : undefined;
  const followingTab =
    tab === "following" || (tab !== "popular" && !!userId && followingIds.length > 0);

  const posts =
    followingTab && userId
      ? await getFollowingFeedPosts(userId)
      : await getFeedPosts(userId);

  const showFollowSuggestions = userId && followingIds.length === 0;

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

        {showFollowSuggestions ? <FollowSuggestions userId={userId} /> : null}

        <div>
          <div className="flex rounded-xl bg-card/60 p-1 border border-border">
            <Link
              href="/feed?tab=popular"
              className={cn(
                "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
                !followingTab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted"
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
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted"
                )}
              >
                Following
              </Link>
            ) : (
              <span
                className="flex-1 cursor-not-allowed rounded-lg py-2 text-center text-sm font-semibold text-muted/60"
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
          <EmptyState
            icon={Users}
            title="No posts from people you follow"
            description="Follow installers to see their work in this feed."
            action={{ label: "Find installers", href: "/discover?tab=people" }}
          />
        ) : (
          <PostFeed
            posts={posts}
            currentUserId={userId}
            showInlineComments
            feedContext={followingTab ? "following" : "popular"}
            followingIds={followingSet}
          />
        )}
      </div>
    </PullToRefresh>
  );
}

import { getSession } from "@/lib/session";
import { fetchAdsForPlacement } from "@/lib/advertising/internal-provider";
import { getTargetingContext } from "@/lib/advertising/context";
import { getAdSettings } from "@/lib/advertising/settings";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";
import type { PostCardData } from "@/lib/queries";
import { PostCard } from "@/components/feed/post-card";
import { FeedWithAds } from "@/components/ads/feed-with-ads";
import { EmptyState } from "@/components/ui/empty-state";
import { Camera } from "lucide-react";
import { headers } from "next/headers";

interface PostFeedWithAdsProps {
  posts: PostCardData[];
  currentUserId?: string;
  showInlineComments?: boolean;
  feedContext?: "following" | "popular";
  followingIds?: Set<string>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
}

function detectDevice(userAgent: string): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

export async function PostFeedWithAds(props: PostFeedWithAdsProps) {
  const {
    posts,
    currentUserId,
    showInlineComments,
    feedContext,
    followingIds,
    emptyTitle = "No posts yet",
    emptyDescription = "Be the first to share an installation!",
    emptyAction,
  } = props;

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const settings = await getAdSettings();
  const session = await getSession();
  const targeting = await getTargetingContext(session?.user?.id);
  const h = await headers();
  const device = detectDevice(h.get("user-agent") ?? "");
  const maxAds =
    device === "mobile" ? settings.mobileMaxFeedAds : settings.desktopMaxFeedAds;

  const betweenAds = settings.adsEnabled
    ? await fetchAdsForPlacement(AD_PLACEMENTS.FEED_BETWEEN_POSTS, {
        limit: Math.min(maxAds, settings.maxFeedAds),
        device,
        targeting,
      })
    : [];

  const postNodes = posts.map((post) => (
    <PostCard
      key={post.id}
      post={post}
      currentUserId={currentUserId}
      showInlineComments={showInlineComments}
      feedContext={feedContext}
      followingIds={followingIds}
    />
  ));

  return (
    <FeedWithAds
      betweenAds={betweenAds}
      minPostsBetweenAds={settings.minPostsBetweenAds}
    >
      {postNodes}
    </FeedWithAds>
  );
}

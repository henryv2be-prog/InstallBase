"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PostCardData } from "@/lib/queries";
import { FEED_MAX_LOADED_POSTS, type FeedTab } from "@/lib/feed-pagination";
import { postHasImmersiveMedia } from "@/lib/immersive-feed-media";
import { ImmersiveSlide } from "@/components/feed/immersive/immersive-slide";
import { ImmersiveAdSlide } from "@/components/feed/immersive/immersive-ad-slide";
import { Button } from "@/components/ui/button";
import type { AdCreative } from "@/lib/advertising/types";
import { interleaveFeedWithAds } from "@/lib/advertising/interleave-feed-ads";

/** Apply brag/bookmark viewer fields from a fresh server row without replacing the feed list. */
function mergePostViewerFields(existing: PostCardData, fresh: PostCardData): PostCardData {
  const freshMedia = new Map(fresh.media.map((item) => [item.id, item]));
  return {
    ...existing,
    bragScore: fresh.bragScore,
    media: existing.media.map((item) => {
      const updated = freshMedia.get(item.id);
      if (!updated) return item;
      return {
        ...item,
        bragScore: updated.bragScore,
        braggedByViewer: updated.braggedByViewer,
      };
    }),
  };
}

interface ImmersiveFeedProps {
  initialPosts: PostCardData[];
  initialCursor: string | null;
  initialHasMore: boolean;
  tab: FeedTab;
  currentUserId?: string;
  followingIds?: string[];
  slideHeightClass?: string;
  betweenAds?: AdCreative[];
  betweenAdsPlacementKey?: string;
  minPostsBetweenAds?: number;
}

function feedSlideKey(item: ReturnType<typeof interleaveFeedWithAds<PostCardData>>[number]): string {
  if (item.kind === "item") return item.value.id;
  return `ad-${item.ad.id}-${item.adSlot}`;
}

export function ImmersiveFeed({
  initialPosts,
  initialCursor,
  initialHasMore,
  tab,
  currentUserId,
  followingIds,
  slideHeightClass = "h-[var(--immersive-slide-h,100dvh)]",
  betweenAds = [],
  betweenAdsPlacementKey = "feed_between_posts",
  minPostsBetweenAds = 4,
}: ImmersiveFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef(tab);
  const [posts, setPosts] = useState(initialPosts.filter(postHasImmersiveMedia));
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const feedItems = useMemo(
    () => interleaveFeedWithAds(posts, betweenAds, minPostsBetweenAds),
    [posts, betweenAds, minPostsBetweenAds]
  );

  const [activeId, setActiveId] = useState<string | null>(() =>
    feedItems[0] ? feedSlideKey(feedItems[0]) : null
  );

  useEffect(() => {
    const tabChanged = tabRef.current !== tab;
    tabRef.current = tab;

    if (tabChanged) {
      setPosts(initialPosts.filter(postHasImmersiveMedia));
      setCursor(initialCursor);
      setHasMore(initialHasMore);
      const nextPosts = initialPosts.filter(postHasImmersiveMedia);
      const nextItems = interleaveFeedWithAds(nextPosts, betweenAds, minPostsBetweenAds);
      setActiveId(nextItems[0] ? feedSlideKey(nextItems[0]) : null);
      scrollerRef.current?.scrollTo(0, 0);
      return;
    }

    // Server actions (e.g. brag) refresh route props — merge scores only, keep scroll + loaded pages.
    const freshById = new Map(initialPosts.map((post) => [post.id, post]));
    setPosts((current) =>
      current.map((post) => {
        const fresh = freshById.get(post.id);
        return fresh ? mergePostViewerFields(post, fresh) : post;
      })
    );
  }, [initialPosts, initialCursor, initialHasMore, tab, betweenAds, minPostsBetweenAds]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursor || posts.length >= FEED_MAX_LOADED_POSTS) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ tab, cursor });
      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) return;
      const data = (await response.json()) as {
        posts: PostCardData[];
        nextCursor: string | null;
        hasMore: boolean;
      };
      setPosts((current) => {
        const seen = new Set(current.map((p) => p.id));
        const next = data.posts.filter((p) => !seen.has(p.id) && postHasImmersiveMedia(p));
        return [...current, ...next].slice(0, FEED_MAX_LOADED_POSTS);
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, posts.length, tab]);

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const index = feedItems.findIndex((item) => feedSlideKey(item) === activeId);
    const postsSeen = index >= 0 ? feedItems.slice(0, index + 1).filter((i) => i.kind === "item").length : 0;
    if (postsSeen >= posts.length - 3 && hasMore && !loading) {
      void loadMoreRef.current();
    }
  }, [activeId, feedItems, posts.length, hasMore, loading]);

  const onSlideVisible = useCallback((slideKey: string) => {
    setActiveId(slideKey);
  }, []);

  const slideCallbacks = useMemo(() => {
    const map = new Map<string, () => void>();
    for (const item of feedItems) {
      const key = feedSlideKey(item);
      map.set(key, () => onSlideVisible(key));
    }
    return map;
  }, [feedItems, onSlideVisible]);

  if (posts.length === 0) {
    return (
      <div className="flex h-[var(--immersive-slide-h,70dvh)] items-center justify-center p-6 text-center text-muted">
        <p>No installation media in this feed yet. Try Popular or post some work.</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      className="immersive-feed-scroll w-full max-w-full snap-y snap-mandatory overflow-y-auto scroll-smooth max-lg:flex-1 max-lg:min-h-0 lg:h-[var(--immersive-slide-h,100dvh)]"
    >
      {feedItems.map((item) => {
        const key = feedSlideKey(item);
        if (item.kind === "ad") {
          return (
            <ImmersiveAdSlide
              key={key}
              ad={item.ad}
              placementKey={betweenAdsPlacementKey}
              active={key === activeId}
              onVisible={slideCallbacks.get(key)}
              slideHeightClass={slideHeightClass}
            />
          );
        }
        return (
          <ImmersiveSlide
            key={key}
            post={item.value}
            active={key === activeId}
            currentUserId={currentUserId}
            followingIds={followingIds}
            onVisible={slideCallbacks.get(key)}
            slideHeightClass={slideHeightClass}
          />
        );
      })}

      {(loading || hasMore) && (
        <div className={`immersive-feed-slide flex items-center justify-center ${slideHeightClass}`}>
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          ) : (
            <Button type="button" variant="secondary" size="sm" onClick={() => void loadMore()}>
              Load more installs
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

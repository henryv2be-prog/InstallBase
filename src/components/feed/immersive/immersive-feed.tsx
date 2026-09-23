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
import { useImmersiveScrollerHeight } from "@/components/feed/immersive/use-immersive-scroller-height";
import { IMMERSIVE_FEED_RESET_EVENT } from "@/components/feed/immersive/immersive-feed-scroll";

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
  slideHeightClass = "h-[var(--immersive-slide-h)] min-h-[var(--immersive-slide-h)]",
  betweenAds = [],
  betweenAdsPlacementKey = "feed_between_posts",
  minPostsBetweenAds = 4,
}: ImmersiveFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useImmersiveScrollerHeight(scrollerRef);
  const tabRef = useRef(tab);
  const betweenAdsRef = useRef(betweenAds);
  betweenAdsRef.current = betweenAds;
  const [posts, setPosts] = useState(initialPosts.filter(postHasImmersiveMedia));
  const postsRef = useRef(posts);
  postsRef.current = posts;
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

  const snapFeedToTop = useCallback(
    (sourcePosts?: PostCardData[]) => {
      const source = sourcePosts ?? postsRef.current;
      const items = interleaveFeedWithAds(source, betweenAdsRef.current, minPostsBetweenAds);
      setActiveId(items[0] ? feedSlideKey(items[0]) : null);
      const el = scrollerRef.current;
      if (!el) return;
      const snap = () => {
        el.scrollTop = 0;
        el.scrollTo({ top: 0, behavior: "instant" });
      };
      snap();
      requestAnimationFrame(snap);
      window.setTimeout(snap, 0);
      window.setTimeout(snap, 50);
      window.setTimeout(snap, 150);
    },
    [minPostsBetweenAds]
  );

  useEffect(() => {
    const onReset = () => snapFeedToTop();
    window.addEventListener(IMMERSIVE_FEED_RESET_EVENT, onReset);
    return () => window.removeEventListener(IMMERSIVE_FEED_RESET_EVENT, onReset);
  }, [snapFeedToTop]);

  useEffect(() => {
    const incoming = initialPosts.filter(postHasImmersiveMedia);
    const tabChanged = tabRef.current !== tab;
    tabRef.current = tab;

    if (tabChanged) {
      setPosts(incoming);
      setCursor(initialCursor);
      setHasMore(initialHasMore);
      snapFeedToTop(incoming);
      return;
    }

    const current = postsRef.current;
    const incomingHeadId = incoming[0]?.id;
    const newPostAtTop =
      Boolean(incomingHeadId) &&
      incomingHeadId !== current[0]?.id &&
      !current.some((post) => post.id === incomingHeadId);

    if (newPostAtTop) {
      setPosts(incoming);
      setCursor(initialCursor);
      setHasMore(initialHasMore);
      snapFeedToTop(incoming);
      return;
    }

    const freshById = new Map(initialPosts.map((post) => [post.id, post]));
    setPosts((prev) =>
      prev.map((post) => {
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
      const response = await fetch(`/api/feed?${params.toString()}`, { cache: "no-store" });
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

  /** Prefetch when the feed is short (common on Following before enough media posts appear). */
  useEffect(() => {
    if (!hasMore || loading || posts.length >= 8) return;
    void loadMoreRef.current();
  }, [hasMore, loading, posts.length, tab]);

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
      className="immersive-feed-scroll w-full max-w-full snap-y snap-mandatory overflow-y-auto max-lg:flex-1 max-lg:min-h-0 lg:h-[var(--immersive-slide-h,min(88dvh,900px))] lg:scroll-smooth"
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PostCardData } from "@/lib/queries";
import { FEED_MAX_LOADED_POSTS } from "@/lib/feed-pagination";
import { postHasImmersiveMedia } from "@/lib/immersive-feed-media";
import { ImmersiveSlide } from "@/components/feed/immersive/immersive-slide";
import { Button } from "@/components/ui/button";

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
  tab: "popular" | "following";
  currentUserId?: string;
  followingIds?: Set<string>;
  slideHeightClass?: string;
}

export function ImmersiveFeed({
  initialPosts,
  initialCursor,
  initialHasMore,
  tab,
  currentUserId,
  followingIds,
  slideHeightClass = "h-[var(--immersive-slide-h,100dvh)]",
}: ImmersiveFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef(tab);
  const [posts, setPosts] = useState(initialPosts.filter(postHasImmersiveMedia));
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(posts[0]?.id ?? null);

  useEffect(() => {
    const tabChanged = tabRef.current !== tab;
    tabRef.current = tab;

    if (tabChanged) {
      setPosts(initialPosts.filter(postHasImmersiveMedia));
      setCursor(initialCursor);
      setHasMore(initialHasMore);
      setActiveId(initialPosts.find(postHasImmersiveMedia)?.id ?? null);
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
  }, [initialPosts, initialCursor, initialHasMore, tab]);

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
    const index = posts.findIndex((p) => p.id === activeId);
    if (index >= posts.length - 3 && hasMore && !loading) {
      void loadMoreRef.current();
    }
  }, [activeId, posts.length, hasMore, loading]);

  const onSlideVisible = useCallback((postId: string) => {
    setActiveId(postId);
  }, []);

  const slideCallbacks = useMemo(() => {
    const map = new Map<string, () => void>();
    for (const post of posts) {
      map.set(post.id, () => onSlideVisible(post.id));
    }
    return map;
  }, [posts, onSlideVisible]);

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
      className="immersive-feed-scroll snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth"
      style={{ height: "var(--immersive-slide-h, 100dvh)" }}
    >
      {posts.map((post) => (
        <ImmersiveSlide
          key={post.id}
          post={post}
          active={post.id === activeId}
          currentUserId={currentUserId}
          followingIds={followingIds}
          onVisible={slideCallbacks.get(post.id)}
          slideHeightClass={slideHeightClass}
        />
      ))}

      {(loading || hasMore) && (
        <div className={`flex items-center justify-center ${slideHeightClass}`}>
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

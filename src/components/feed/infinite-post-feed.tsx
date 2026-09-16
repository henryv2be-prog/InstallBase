"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AdCreative } from "@/lib/advertising/types";
import type { PostCardData } from "@/lib/queries";
import { PostCard } from "@/components/feed/post-card";
import { FeedWithAds } from "@/components/ads/feed-with-ads";
import { Button } from "@/components/ui/button";
import { FEED_REFRESH_EVENT } from "@/lib/feed-refresh";

interface InfinitePostFeedProps {
  initialPosts: PostCardData[];
  initialCursor: string | null;
  initialHasMore: boolean;
  tab: "popular" | "following";
  currentUserId?: string;
  showInlineComments?: boolean;
  feedContext?: "following" | "popular";
  followingIds?: Set<string>;
  betweenAds: AdCreative[];
  minPostsBetweenAds: number;
}

export function InfinitePostFeed({
  initialPosts,
  initialCursor,
  initialHasMore,
  tab,
  currentUserId,
  showInlineComments,
  feedContext,
  followingIds,
  betweenAds,
  minPostsBetweenAds,
}: InfinitePostFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef(tab);
  const latestInitialRef = useRef({ initialPosts, initialCursor, initialHasMore });

  latestInitialRef.current = { initialPosts, initialCursor, initialHasMore };

  useEffect(() => {
    const tabChanged = tabRef.current !== tab;
    tabRef.current = tab;

    if (tabChanged) {
      setPosts(initialPosts);
      setCursor(initialCursor);
      setHasMore(initialHasMore);
      setError(null);
      return;
    }

    setPosts((current) => {
      const initialIds = new Set(initialPosts.map((post) => post.id));
      const loadedMore = current.filter((post) => !initialIds.has(post.id));
      return [...initialPosts, ...loadedMore];
    });
    setCursor(initialCursor);
    setHasMore(initialHasMore);
  }, [initialPosts, initialCursor, initialHasMore, tab]);

  useEffect(() => {
    const resetFeed = () => {
      const { initialPosts, initialCursor, initialHasMore } = latestInitialRef.current;
      setPosts(initialPosts);
      setCursor(initialCursor);
      setHasMore(initialHasMore);
      setError(null);
    };

    window.addEventListener(FEED_REFRESH_EVENT, resetFeed);
    return () => window.removeEventListener(FEED_REFRESH_EVENT, resetFeed);
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursor) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ tab, cursor });
      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) {
        throw new Error(response.status === 401 ? "Sign in to load more" : "Could not load more posts");
      }

      const data = (await response.json()) as {
        posts: PostCardData[];
        nextCursor: string | null;
        hasMore: boolean;
      };

      setPosts((current) => {
        const seen = new Set(current.map((post) => post.id));
        const next = data.posts.filter((post) => !seen.has(post.id));
        return [...current, ...next];
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load more posts");
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, tab]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const initialCount = initialPosts.length;
  const initialNodes = posts.slice(0, initialCount).map((post) => (
    <PostCard
      key={post.id}
      post={post}
      currentUserId={currentUserId}
      showInlineComments={showInlineComments}
      feedContext={feedContext}
      followingIds={followingIds}
    />
  ));

  const loadedMoreNodes = posts.slice(initialCount).map((post) => (
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
    <div className="space-y-4">
      <FeedWithAds betweenAds={betweenAds} minPostsBetweenAds={minPostsBetweenAds}>
        {initialNodes}
      </FeedWithAds>

      {loadedMoreNodes.length > 0 && <div className="space-y-4">{loadedMoreNodes}</div>}

      {hasMore && (
        <div ref={sentinelRef} className="flex min-h-12 items-center justify-center py-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted" aria-label="Loading more posts" />
          ) : error ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-muted">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void loadMore()}>
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-4 text-center text-xs text-muted">You&apos;re all caught up</p>
      )}
    </div>
  );
}

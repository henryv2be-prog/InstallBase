"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AdCreative } from "@/lib/advertising/types";
import { FEED_MAX_LOADED_POSTS } from "@/lib/feed-pagination";
import type { PostCardData } from "@/lib/queries";
import { PostCard } from "@/components/feed/post-card";
import { FeedWithAds } from "@/components/ads/feed-with-ads";
import { Button } from "@/components/ui/button";
import { FEED_REFRESH_EVENT, requestFeedReset } from "@/lib/feed-refresh";

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
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef(tab);
  const loadingRef = useRef(false);
  const postsCountRef = useRef(initialPosts.length);
  const latestInitialRef = useRef({ initialPosts, initialCursor, initialHasMore });

  latestInitialRef.current = { initialPosts, initialCursor, initialHasMore };
  postsCountRef.current = posts.length;

  const atPostLimit = posts.length >= FEED_MAX_LOADED_POSTS;
  const canLoadMore = hasMore && !atPostLimit;

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
      return [...initialPosts, ...loadedMore].slice(0, FEED_MAX_LOADED_POSTS);
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
    if (!canLoadMore || loadingRef.current || !cursor) return;
    if (postsCountRef.current >= FEED_MAX_LOADED_POSTS) return;

    loadingRef.current = true;
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
        return [...current, ...next].slice(0, FEED_MAX_LOADED_POSTS);
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load more posts");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [canLoadMore, cursor, tab]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !canLoadMore) return;

    let loadTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(() => {
          void loadMore();
        }, 150);
      },
      { rootMargin: "160px" }
    );

    observer.observe(node);
    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      observer.disconnect();
    };
  }, [canLoadMore, loadMore]);

  const initialCount = initialPosts.length;
  const initialNodes = posts.slice(0, initialCount).map((post) => (
    <PostCard
      key={post.id}
      post={post}
      currentUserId={currentUserId}
      showInlineComments={showInlineComments}
      feedContext={feedContext}
      followingIds={followingIds}
      deferHeavyContent={false}
    />
  ));

  const loadedMoreNodes = posts.slice(initialCount).map((post) => (
    <PostCard
      key={post.id}
      post={post}
      currentUserId={currentUserId}
      showInlineComments={false}
      feedContext={feedContext}
      followingIds={followingIds}
      deferHeavyContent
    />
  ));

  return (
    <div className="space-y-4">
      <FeedWithAds betweenAds={betweenAds} minPostsBetweenAds={minPostsBetweenAds}>
        {initialNodes}
      </FeedWithAds>

      {loadedMoreNodes.length > 0 && <div className="space-y-4">{loadedMoreNodes}</div>}

      {canLoadMore && (
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

      {atPostLimit && hasMore && (
        <div className="rounded-xl border border-border bg-card/60 px-4 py-3 text-center">
          <p className="text-sm text-muted">
            Showing the latest {FEED_MAX_LOADED_POSTS} posts to keep things fast.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              requestFeedReset();
              router.refresh();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to top & refresh
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 0 && !atPostLimit && (
        <p className="py-4 text-center text-xs text-muted">You&apos;re all caught up</p>
      )}
    </div>
  );
}

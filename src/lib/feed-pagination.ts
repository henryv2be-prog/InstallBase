import type { Prisma } from "@/generated/prisma/client";

export const FEED_PAGE_SIZE = 20;
/** Cap client-side feed length to avoid mobile browser memory crashes. */
export const FEED_MAX_LOADED_POSTS = 60;
/** Bound popular-tab exclude id lists carried in cursors. */
export const FEED_MAX_CURSOR_EXCLUDE_IDS = 80;

export type FeedTab = "popular" | "following";

export type FeedCursor = {
  createdAt: string;
  id: string;
  excludeIds?: string[];
};

export type FeedPageResult<T> = {
  posts: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function toFeedCursor(post: { id: string; createdAt: Date | string }, excludeIds?: string[]): FeedCursor {
  return {
    createdAt: new Date(post.createdAt).toISOString(),
    id: post.id,
    excludeIds: excludeIds?.length
      ? excludeIds.slice(-FEED_MAX_CURSOR_EXCLUDE_IDS)
      : undefined,
  };
}

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeFeedCursor(value: string | null | undefined): FeedCursor | null {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as FeedCursor;
    if (!parsed?.id || !parsed?.createdAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Posts older than the cursor in a createdAt desc feed. */
export function feedCursorWhere(cursor: FeedCursor): Prisma.PostWhereInput {
  const createdAt = new Date(cursor.createdAt);
  return {
    OR: [
      { createdAt: { lt: createdAt } },
      { AND: [{ createdAt }, { id: { lt: cursor.id } }] },
    ],
  };
}

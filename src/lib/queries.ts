import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma, PostType } from "@/generated/prisma/client";
import { BRAG_CATEGORIES } from "@/lib/constants";
import { bragHotScore, recencyMultiplier, startOfWeek } from "@/lib/ranking";
import { braggablePostWhere, isBraggableType } from "@/lib/brag";
import { getPostTradeGroupLabel, isPortfolioPost } from "@/lib/work-posts";
import { getLandingPageStats } from "@/lib/analytics/page-views";
import { feedBoostForMemberTier } from "@/lib/membership";
import {
  FEED_PAGE_SIZE,
  type FeedCursor,
  type FeedPageResult,
  encodeFeedCursor,
  feedCursorWhere,
  toFeedCursor,
} from "@/lib/feed-pagination";

/** Card/list payload: counts instead of every comment, bookmark, and brag row. */
export const postCardInclude = {
  author: { include: { profile: true, reputation: true } },
  media: { orderBy: { order: "asc" as const } },
  tags: { include: { tag: true } },
  products: { include: { product: { include: { brand: true } } } },
  categories: { include: { category: true } },
  _count: { select: { comments: true, answers: true } },
} satisfies Prisma.PostInclude;

export const postInclude = {
  ...postCardInclude,
  comments: {
    include: { author: { include: { profile: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  answers: {
    include: { author: { include: { profile: true } } },
    orderBy: { helpful: "desc" as const },
  },
} satisfies Prisma.PostInclude;

type PostCardRow = Prisma.PostGetPayload<{ include: typeof postCardInclude }>;

export type PostMediaWithViewerState = PostCardRow["media"][number] & {
  braggedByViewer: boolean;
};

export type PostCardData = Omit<PostCardRow, "media"> & {
  bookmarks: { userId: string }[];
  media: PostMediaWithViewerState[];
};

type PostDetailRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export type PostDetailData = Omit<PostDetailRow, "media"> & {
  bookmarks: { userId: string }[];
  media: PostMediaWithViewerState[];
};

async function withViewerState<T extends { id: string; media: { id: string }[] }>(
  posts: T[],
  userId?: string
): Promise<(T & { bookmarks: { userId: string }[]; media: (T["media"][number] & { braggedByViewer: boolean })[] })[]> {
  if (posts.length === 0) return [];

  const mediaIds = posts.flatMap((post) => post.media.map((item) => item.id));

  if (!userId) {
    return posts.map((post) => ({
      ...post,
      bookmarks: [],
      media: post.media.map((item) => ({ ...item, braggedByViewer: false })),
    }));
  }

  const ids = posts.map((post) => post.id);
  const [bookmarks, mediaBrags] = await Promise.all([
    prisma.bookmark.findMany({ where: { userId, postId: { in: ids } }, select: { postId: true, userId: true } }),
    mediaIds.length > 0
      ? prisma.mediaBragPoint.findMany({
          where: { userId, postMediaId: { in: mediaIds } },
          select: { postMediaId: true },
        })
      : Promise.resolve([]),
  ]);

  const saved = new Set(bookmarks.map((row) => row.postId));
  const braggedMedia = new Set(mediaBrags.map((row) => row.postMediaId));

  return posts.map((post) => ({
    ...post,
    bookmarks: saved.has(post.id) ? [{ userId }] : [],
    media: post.media.map((item) => ({
      ...item,
      braggedByViewer: braggedMedia.has(item.id),
    })),
  }));
}

async function cachedRows<T>(key: string[], fn: () => Promise<T>, revalidate = 20): Promise<T> {
  return unstable_cache(async () => JSON.parse(JSON.stringify(await fn())) as T, key, {
    revalidate,
    tags: ["posts"],
  })();
}

async function loadPostCards(
  args: Omit<Prisma.PostFindManyArgs, "include" | "select">,
  userId: string | undefined,
  cacheKey: string[]
) {
  const posts = await cachedRows(cacheKey, () =>
    prisma.post.findMany({ ...args, include: postCardInclude })
  );
  return withViewerState(posts, userId);
}

export const getFollowingIds = cache(async function getFollowingIds(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return follows.map((f) => f.followingId);
});

export async function isFollowing(followerId: string, followingId: string) {
  const row = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getFollowersOf(userId: string) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      follower: { include: { profile: true } },
    },
  });
}

export async function getFollowingOf(userId: string) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      following: { include: { profile: true } },
    },
  });
}

export async function getFollowingFeedPosts(userId: string, limit = FEED_PAGE_SIZE) {
  const { posts } = await getFollowingFeedPage(userId, limit);
  return posts;
}

export async function getFeedPosts(userId?: string, limit = FEED_PAGE_SIZE) {
  const { posts } = await getPopularFeedPage(userId, limit);
  return posts;
}

export async function getFollowingFeedPage(
  userId: string,
  limit = FEED_PAGE_SIZE,
  cursor?: FeedCursor | null
): Promise<FeedPageResult<PostCardData>> {
  const followingIds = await getFollowingIds(userId);
  if (followingIds.length === 0) {
    return { posts: [], nextCursor: null, hasMore: false };
  }

  const rows = await prisma.post.findMany({
    where: {
      authorId: { in: followingIds },
      ...(cursor ? feedCursorWhere(cursor) : {}),
    },
    include: postCardInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const posts = await withViewerState(page, userId);
  const last = page[page.length - 1];

  return {
    posts,
    hasMore,
    nextCursor: hasMore && last ? encodeFeedCursor(toFeedCursor(last)) : null,
  };
}

export async function getPopularFeedPage(
  userId?: string,
  limit = FEED_PAGE_SIZE,
  cursor?: FeedCursor | null
): Promise<FeedPageResult<PostCardData>> {
  if (!cursor) {
    const posts = await scorePopularFeedPosts(userId, limit);
    if (posts.length === 0) {
      return { posts: [], nextCursor: null, hasMore: false };
    }

    const oldest = posts.reduce((current, post) =>
      new Date(post.createdAt) < new Date(current.createdAt) ? post : current
    );
    const excludeIds = posts.map((post) => post.id);
    const remaining = await prisma.post.count({
      where: {
        id: { notIn: excludeIds },
        ...feedCursorWhere(toFeedCursor(oldest)),
      },
    });

    return {
      posts,
      hasMore: remaining > 0,
      nextCursor: remaining > 0 ? encodeFeedCursor(toFeedCursor(oldest, excludeIds)) : null,
    };
  }

  const excludeIds = cursor.excludeIds ?? [];
  const rows = await prisma.post.findMany({
    where: {
      id: { notIn: excludeIds },
      ...feedCursorWhere(cursor),
    },
    include: postCardInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const posts = await withViewerState(page, userId);
  const last = page[page.length - 1];
  const nextExcludeIds = [...excludeIds, ...page.map((post) => post.id)];

  return {
    posts,
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeFeedCursor(toFeedCursor(last, nextExcludeIds))
        : null,
  };
}

async function scorePopularFeedPosts(userId?: string, limit = FEED_PAGE_SIZE) {
  const take = Math.min(limit + 8, 28);
  const [followingIds, posts] = await Promise.all([
    userId ? getFollowingIds(userId) : Promise.resolve([] as string[]),
    loadPostCards(
      {
        take,
        orderBy: { createdAt: "desc" },
      },
      userId,
      ["feed-recent", String(take)]
    ),
  ]);

  const scored = posts.map((post) => {
    let score = 0;
    const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
    score += Math.max(0, 100 - ageHours * 2);
    score += post._count.comments * 5;
    score += post.bragScore * 2 * recencyMultiplier(post.createdAt);
    if (followingIds.includes(post.authorId)) score += 50;
    if (post.type === "QUESTION" && !post.solved) score += 15;
    score += feedBoostForMemberTier(post.author.profile?.memberTier);
    return { post, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

export async function getPostsByType(type: PostType, limit = 20, userId?: string) {
  if (type === "BRAG") return getHotBrags(limit, userId);

  return loadPostCards(
    {
      where: { type },
      take: limit,
      orderBy: { createdAt: "desc" },
    },
    userId,
    ["posts-by-type", type, String(limit)]
  );
}

export async function getPopularQuestions(limit = 6, userId?: string) {
  return loadPostCards(
    {
      where: { type: "QUESTION" },
      take: limit,
      orderBy: { comments: { _count: "desc" } },
    },
    userId,
    ["questions-popular", String(limit)]
  );
}

export async function getHotBrags(limit = 20, userId?: string) {
  const poolSize = Math.max(limit * 4, 40);
  const [scored, recent] = await Promise.all([
    cachedRows(
      ["hot-brag-scored", String(poolSize)],
      () =>
        prisma.post.findMany({
          where: { ...braggablePostWhere, bragScore: { gt: 0 } },
          take: poolSize,
          select: { id: true, bragScore: true, createdAt: true },
          orderBy: [{ bragScore: "desc" }, { createdAt: "desc" }],
        })
    ),
    cachedRows(
      ["hot-brag-recent", String(poolSize)],
      () =>
        prisma.post.findMany({
          where: braggablePostWhere,
          take: poolSize,
          select: { id: true, bragScore: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        })
    ),
  ]);

  const byId = new Map<string, { id: string; bragScore: number; createdAt: Date }>();
  for (const row of [...scored, ...recent]) {
    byId.set(row.id, row);
  }

  const topIds = [...byId.values()]
    .sort(
      (a, b) =>
        bragHotScore(b.bragScore, new Date(b.createdAt)) - bragHotScore(a.bragScore, new Date(a.createdAt))
    )
    .slice(0, limit)
    .map((row) => row.id);

  if (topIds.length === 0) return [];

  const posts = await loadPostCards(
    { where: { id: { in: topIds } } },
    userId,
    ["posts-by-ids", ...topIds]
  );
  const postsById = new Map(posts.map((post) => [post.id, post]));
  return topIds.map((id) => postsById.get(id)).filter((post): post is NonNullable<typeof post> => Boolean(post));
}

export async function getAllTimeBrags(limit = 4, userId?: string) {
  return loadPostCards(
    {
      where: { ...braggablePostWhere, bragScore: { gt: 0 } },
      take: limit,
      orderBy: [{ bragScore: "desc" }, { createdAt: "desc" }],
    },
    userId,
    ["all-time-brags", String(limit)]
  );
}

export const getPost = cache(async function getPost(id: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
  if (!post) return null;
  const [withState] = await withViewerState([post], userId);
  return withState;
});

export async function getProfileByUsername(username: string, viewerId?: string) {
  const profile = await cachedRows(
    ["profile-core", username],
    () =>
      prisma.profile.findUnique({
        where: { username },
        include: {
          user: {
            include: {
              reputation: true,
              posts: {
                include: postCardInclude,
                orderBy: { createdAt: "desc" },
                take: 12,
              },
              projects: { include: { media: true }, orderBy: { createdAt: "desc" } },
              _count: { select: { followers: true, following: true } },
            },
          },
        },
      }),
    30
  );

  if (!profile) return null;

  const [posts, alreadyFollowing, followsYou] = await Promise.all([
    withViewerState(profile.user.posts, viewerId),
    viewerId && viewerId !== profile.userId ? isFollowing(viewerId, profile.userId) : false,
    viewerId && viewerId !== profile.userId ? isFollowing(profile.userId, viewerId) : false,
  ]);

  return {
    ...profile,
    alreadyFollowing,
    followsYou,
    user: {
      ...profile.user,
      posts,
    },
  };
}

export async function getTrendingBrags(limit = 10, userId?: string) {
  return getHotBrags(limit, userId);
}

export async function getBragLeaderboard(limit = 5) {
  return cachedRows(
    ["brag-leaderboard", String(limit)],
    async () => {
      const grouped = await prisma.post.groupBy({
        by: ["authorId"],
        where: { ...braggablePostWhere, bragScore: { gt: 0 } },
        _sum: { bragScore: true },
        orderBy: { _sum: { bragScore: "desc" } },
        take: limit,
      });

      if (grouped.length === 0) return [];

      const profiles = await prisma.profile.findMany({
        where: { userId: { in: grouped.map((row) => row.authorId) } },
        include: { user: true },
      });
      const byUserId = new Map(profiles.map((profile) => [profile.userId, profile]));

      return grouped
        .map((row) => {
          const profile = byUserId.get(row.authorId);
          if (!profile) return null;
          return {
            ...profile,
            totalBragPoints: row._sum.bragScore ?? 0,
          };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row));
    },
    60
  );
}

export async function getBragOfWeek(userId?: string) {
  const weekStart = startOfWeek();

  const featured = await prisma.bragOfWeek.findMany({
    where: { weekStart, featured: true },
  });

  if (featured.length > 0) {
    const featuredPosts = await loadPostCards(
      { where: { id: { in: featured.map((row) => row.postId) } } },
      userId,
      ["brag-featured", weekStart.toISOString(), ...featured.map((row) => row.postId)]
    );
    const byId = new Map(featuredPosts.map((post) => [post.id, post]));
    const featuredRows = featured
      .map((row) => ({ category: row.category, post: byId.get(row.postId) }))
      .filter((row) => row.post && isBraggableType(row.post.type));
    featuredRows.sort((a, b) => (b.post?.bragScore ?? 0) - (a.post?.bragScore ?? 0));
    if (featuredRows.length > 0) return featuredRows;
  }

  const thisWeek = await loadPostCards(
    {
      where: { ...braggablePostWhere, createdAt: { gte: weekStart } },
      take: 8,
      orderBy: [{ bragScore: "desc" }, { createdAt: "desc" }],
    },
    userId,
    ["brag-week", weekStart.toISOString()]
  );

  const picked = [...thisWeek];
  if (picked.length < 8) {
    const extra = await getHotBrags(8, userId);
    const seen = new Set(picked.map((post) => post.id));
    for (const post of extra) {
      if (picked.length >= 8) break;
      if (!seen.has(post.id)) picked.push(post);
    }
  }

  picked.sort((a, b) => b.bragScore - a.bragScore);

  return picked.slice(0, 8).map((post, i) => ({
    category: BRAG_CATEGORIES[i % BRAG_CATEGORIES.length],
    post,
  }));
}

export async function getLandingCommunityStats() {
  return cachedRows(
    ["landing-community-stats"],
    async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const [installersSharing, installsThisWeek, questionsAnswered, bragTotals] = await Promise.all([
        prisma.user.count({
          where: { posts: { some: { media: { some: {} } } } },
        }),
        prisma.post.count({
          where: {
            createdAt: { gte: weekAgo },
            media: { some: {} },
            type: { not: "QUESTION" },
          },
        }),
        prisma.answer.count(),
        prisma.post.aggregate({
          where: braggablePostWhere,
          _sum: { bragScore: true },
        }),
      ]);

      return {
        installersSharing,
        installsThisWeek,
        questionsAnswered,
        totalBragPoints: bragTotals._sum.bragScore ?? 0,
      };
    },
    120
  );
}

export async function getDiscoverData(userId?: string) {
  const [trendingBrags, trendingQuestions, topInstallers, bragLeaderboard, products, jobs] = await Promise.all([
    getTrendingBrags(6, userId),
    getPopularQuestions(6, userId),
    getTopInstallers(),
    getBragLeaderboard(5),
    getPopularProducts(),
    getActiveJobs(),
  ]);

  return { trendingBrags, trendingQuestions, topInstallers, bragLeaderboard, products, jobs };
}

export async function getTopInstallers() {
  return cachedRows(
    ["discover-installers"],
    () =>
      prisma.profile.findMany({
        take: 8,
        orderBy: { reputationScore: "desc" },
        include: { user: true },
      }),
    60
  );
}

export async function getPopularProducts() {
  return cachedRows(
    ["discover-products"],
    () =>
      prisma.product.findMany({
        take: 8,
        include: { brand: true, _count: { select: { postProducts: true } } },
        orderBy: { postProducts: { _count: "desc" } },
      }),
    60
  );
}

export async function getActiveJobs() {
  return cachedRows(
    ["discover-jobs"],
    () => prisma.job.findMany({ where: { active: true }, take: 4, orderBy: { createdAt: "desc" } }),
    60
  );
}

export async function searchAll(query: string, userId?: string) {
  const q = query.trim();
  if (!q) return { users: [], posts: [], products: [], projects: [] };

  const [users, posts, products, projects] = await Promise.all([
    prisma.profile.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { user: { name: { contains: q, mode: "insensitive" } } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: { user: true },
    }),
    loadPostCards(
      {
        where: {
          OR: [
            { content: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 15,
      },
      userId,
      ["search-posts", q]
    ),
    prisma.product.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 10,
      include: { brand: true },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      include: { author: { include: { profile: true } }, media: true },
    }),
  ]);

  return { users, posts, products, projects };
}

export async function getProjects(limit = 20) {
  return cachedRows(
    ["projects", String(limit)],
    () =>
      prisma.project.findMany({
        take: limit,
        include: {
          author: { include: { profile: true } },
          media: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
    60
  );
}

export async function getProject(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: {
      author: { include: { profile: true, reputation: true } },
      media: { orderBy: { order: "asc" } },
    },
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: { actor: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export const getActivityCounts = cache(async function getActivityCounts(userId: string) {
  const [notifications, messages] = await Promise.all([
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.message.count({
      where: {
        read: false,
        senderId: { not: userId },
        conversation: { participants: { some: { userId } } },
      },
    }),
  ]);
  return { notifications, messages, total: notifications + messages };
});

export async function getBookmarkedPosts(userId: string, limit = 30) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { post: { include: postCardInclude } },
  });
  const posts = bookmarks.map((b) => b.post);
  return withViewerState(posts, userId);
}

export async function getCommentPreview(postId: string, limit = 3) {
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { author: { include: { profile: true } } },
  });
}

export async function getSuggestedSearchTerms() {
  return ["Hikvision", "PoE", "ANPR", "Ubiquiti", "CCTV", "access control"];
}

export async function getConversations(userId: string) {
  return prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { include: { profile: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });
}

export async function findConversationBetweenUsers(userIdA: string, userIdB: string) {
  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId: userIdA },
    include: {
      conversation: {
        include: { participants: { select: { userId: true } } },
      },
    },
  });

  for (const { conversation } of memberships) {
    const userIds = conversation.participants.map((p) => p.userId);
    if (userIds.length === 2 && userIds.includes(userIdB)) {
      return conversation;
    }
  }
  return null;
}

export async function getOrCreateConversation(userIdA: string, userIdB: string) {
  const existing = await findConversationBetweenUsers(userIdA, userIdB);
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: userIdA }, { userId: userIdB }],
      },
    },
  });
}

export async function getAdminStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const [
    users,
    activeUsers,
    posts,
    brags,
    questions,
    comments,
    reports,
    newUsersWeek,
    landingStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { posts: { some: {} } } }),
    prisma.post.count(),
    prisma.post.count({
      where: { ...braggablePostWhere, media: { some: {} } },
    }),
    prisma.post.count({ where: { type: "QUESTION" } }),
    prisma.comment.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    getLandingPageStats(),
  ]);

  const uniqueVisitorsWeek = landingStats.uniqueVisitorsWeek;
  const signupRateWeek =
    uniqueVisitorsWeek > 0
      ? Math.round((newUsersWeek / uniqueVisitorsWeek) * 1000) / 10
      : null;

  return {
    users,
    activeUsers,
    posts,
    brags,
    questions,
    comments,
    reports,
    newUsersWeek,
    landingViewsToday: landingStats.viewsToday,
    landingUniqueVisitorsToday: landingStats.uniqueVisitorsToday,
    landingViewsWeek: landingStats.viewsWeek,
    landingUniqueVisitorsWeek: uniqueVisitorsWeek,
    landingViewsAllTime: landingStats.viewsAllTime,
    signupRateWeek,
  };
}

export async function getAdminData() {
  const [stats, pendingReports, recentUsers, recentPosts] = await Promise.all([
    getAdminStats(),
    prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        reporter: { include: { profile: true } },
        post: { include: { author: { include: { profile: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        createdAt: true,
        profile: { select: { username: true, memberTier: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.post.findMany({
      include: { author: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return { stats, pendingReports, recentUsers, recentPosts };
}

export async function getProduct(slug: string, userId?: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      postProducts: {
        include: {
          post: { include: postCardInclude },
        },
        take: 20,
      },
    },
  });
  if (!product) return null;
  const posts = await withViewerState(
    product.postProducts.map((row) => row.post),
    userId
  );
  const byId = new Map(posts.map((post) => [post.id, post]));
  return {
    ...product,
    postProducts: product.postProducts
      .map((row) => {
        const post = byId.get(row.post.id);
        return post ? { ...row, post } : null;
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row)),
  };
}

export async function getJobs() {
  return prisma.job.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { children: true, brands: true },
    where: { parentId: null },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: { brand: true },
    orderBy: { name: "asc" },
  });
}

export async function getUserPlatformRoles(userId: string) {
  const rows = await prisma.userPlatformRole.findMany({
    where: { userId },
    select: { role: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => row.role);
}

export type WorkPortfolioGroup = {
  trade: string;
  count: number;
  posts: PostCardData[];
};

export async function getWorkPortfolio(userId: string, viewerId?: string) {
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
      inPortfolio: true,
    },
    include: postCardInclude,
    orderBy: { createdAt: "desc" },
  });

  const withState = await withViewerState(posts, viewerId);
  const groupsMap = new Map<string, PostCardData[]>();

  for (const post of withState) {
    if (!isPortfolioPost(post)) continue;
    const trade = getPostTradeGroupLabel(post);
    const existing = groupsMap.get(trade) ?? [];
    existing.push(post);
    groupsMap.set(trade, existing);
  }

  const visiblePosts = withState.filter(isPortfolioPost);
  const groups: WorkPortfolioGroup[] = [...groupsMap.entries()]
    .map(([trade, groupPosts]) => ({
      trade,
      count: groupPosts.length,
      posts: groupPosts,
    }))
    .sort((a, b) => b.count - a.count || a.trade.localeCompare(b.trade));

  return {
    totalCount: visiblePosts.length,
    groups,
    posts: visiblePosts,
  };
}

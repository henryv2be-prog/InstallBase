import { prisma } from "@/lib/prisma";
import type { PostType } from "@/generated/prisma/client";
import { BRAG_CATEGORIES } from "@/lib/constants";
import { bragHotScore, recencyMultiplier, startOfWeek } from "@/lib/ranking";

export const postInclude = {
  author: { include: { profile: true, reputation: true } },
  media: { orderBy: { order: "asc" as const } },
  likes: true,
  comments: { include: { author: { include: { profile: true } } }, orderBy: { createdAt: "asc" as const } },
  bookmarks: true,
  bragPoints: true,
  answers: {
    include: { author: { include: { profile: true } } },
    orderBy: { helpful: "desc" as const },
  },
  tags: { include: { tag: true } },
  products: { include: { product: { include: { brand: true } } } },
};

export async function getFollowingIds(userId: string) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return follows.map((f) => f.followingId);
}

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

export async function getFollowingFeedPosts(userId: string, limit = 30) {
  const followingIds = await getFollowingIds(userId);
  if (followingIds.length === 0) return [];

  return prisma.post.findMany({
    where: { authorId: { in: followingIds } },
    take: limit,
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedPosts(userId?: string, limit = 20) {
  let followingIds: string[] = [];

  if (userId) {
    followingIds = await getFollowingIds(userId);
  }

  const posts = await prisma.post.findMany({
    take: limit * 2,
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });

  const scored = posts.map((post) => {
    let score = 0;
    const ageHours = (Date.now() - post.createdAt.getTime()) / 3600000;
    score += Math.max(0, 100 - ageHours * 2);
    score += post.likes.length * 3;
    score += post.comments.length * 5;
    score += post.bragScore * 2 * recencyMultiplier(post.createdAt);
    if (followingIds.includes(post.authorId)) score += 50;
    if (post.type === "BRAG") score += 10 * recencyMultiplier(post.createdAt);
    if (post.type === "QUESTION" && !post.solved) score += 15;
    return { post, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

export async function getPostsByType(type: PostType, limit = 20) {
  if (type === "BRAG") return getHotBrags(limit);

  return prisma.post.findMany({
    where: { type },
    take: limit,
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getHotBrags(limit = 20) {
  const posts = await prisma.post.findMany({
    where: { type: "BRAG" },
    take: Math.max(limit * 5, 80),
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });

  return posts
    .map((post) => ({ post, score: bragHotScore(post.bragScore, post.createdAt) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.post);
}

export async function getAllTimeBrags(limit = 4) {
  return prisma.post.findMany({
    where: { type: "BRAG", bragScore: { gt: 0 } },
    take: limit,
    include: postInclude,
    orderBy: [{ bragScore: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

export async function getProfileByUsername(username: string) {
  return prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          reputation: true,
          posts: {
            include: postInclude,
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          projects: { include: { media: true }, orderBy: { createdAt: "desc" } },
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function getTrendingBrags(limit = 10) {
  return getHotBrags(limit);
}

export async function getBragOfWeek() {
  const weekStart = startOfWeek();

  const featured = await prisma.bragOfWeek.findMany({
    where: { weekStart, featured: true },
    orderBy: { category: "asc" },
  });

  const posts = await Promise.all(
    featured.map(async (f) => ({
      category: f.category,
      post: await prisma.post.findUnique({ where: { id: f.postId }, include: postInclude }),
    }))
  );

  if (posts.length === 0) {
    const thisWeek = await prisma.post.findMany({
      where: { type: "BRAG", createdAt: { gte: weekStart } },
      take: 24,
      include: postInclude,
      orderBy: [{ bragScore: "desc" }, { createdAt: "desc" }],
    });

    const picked = [...thisWeek];
    if (picked.length < 8) {
      const extra = await getHotBrags(8);
      const seen = new Set(picked.map((post) => post.id));
      for (const post of extra) {
        if (picked.length >= 8) break;
        if (!seen.has(post.id)) picked.push(post);
      }
    }

    return picked.slice(0, 8).map((post, i) => ({
      category: BRAG_CATEGORIES[i % BRAG_CATEGORIES.length],
      post,
    }));
  }

  return posts;
}

export async function getDiscoverData() {
  const [trendingBrags, trendingQuestions, topInstallers, products, jobs] = await Promise.all([
    getTrendingBrags(6),
    prisma.post.findMany({
      where: { type: "QUESTION" },
      take: 6,
      include: postInclude,
      orderBy: { comments: { _count: "desc" } },
    }),
    prisma.profile.findMany({
      take: 8,
      orderBy: { reputationScore: "desc" },
      include: { user: true },
    }),
    prisma.product.findMany({
      take: 8,
      include: { brand: true, postProducts: true },
      orderBy: { postProducts: { _count: "desc" } },
    }),
    prisma.job.findMany({ where: { active: true }, take: 4, orderBy: { createdAt: "desc" } }),
  ]);

  return { trendingBrags, trendingQuestions, topInstallers, products, jobs };
}

export async function searchAll(query: string) {
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
    prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 15,
      include: postInclude,
    }),
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
  return prisma.project.findMany({
    take: limit,
    include: {
      author: { include: { profile: true } },
      media: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
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
  const [
    users,
    activeUsers,
    posts,
    brags,
    questions,
    comments,
    reports,
    newUsersWeek,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { posts: { some: {} } } }),
    prisma.post.count(),
    prisma.post.count({ where: { type: "BRAG" } }),
    prisma.post.count({ where: { type: "QUESTION" } }),
    prisma.comment.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
  ]);

  return { users, activeUsers, posts, brags, questions, comments, reports, newUsersWeek };
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
      include: { profile: true },
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

export async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      postProducts: {
        include: {
          post: { include: postInclude },
        },
      },
    },
  });
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

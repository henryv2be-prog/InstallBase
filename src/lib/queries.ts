import { prisma } from "@/lib/prisma";
import type { PostType } from "@/generated/prisma/client";

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

export async function getFeedPosts(userId?: string, limit = 20) {
  let followingIds: string[] = [];
  let userSpecialties: string[] = [];

  if (userId) {
    const [follows, profile] = await Promise.all([
      prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
      prisma.profile.findUnique({ where: { userId }, select: { specialties: true, city: true } }),
    ]);
    followingIds = follows.map((f) => f.followingId);
    userSpecialties = profile?.specialties ?? [];
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
    score += post.bragScore * 2;
    if (followingIds.includes(post.authorId)) score += 50;
    if (post.type === "BRAG") score += 10;
    if (post.type === "QUESTION" && !post.solved) score += 15;
    return { post, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

export async function getPostsByType(type: PostType, limit = 20) {
  return prisma.post.findMany({
    where: { type },
    take: limit,
    include: postInclude,
    orderBy: type === "BRAG" ? { bragScore: "desc" } : { createdAt: "desc" },
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
  return prisma.post.findMany({
    where: { type: "BRAG" },
    take: limit,
    include: postInclude,
    orderBy: { bragScore: "desc" },
  });
}

export async function getBragOfWeek() {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

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
    const topBrags = await getTrendingBrags(8);
    return topBrags.map((post, i) => ({
      category: [
        "Best CCTV Installation",
        "Best Access Control",
        "Best Cable Management",
        "Best Rack",
        "Biggest Installation",
        "Most Creative Solution",
        "Best Before & After",
        "Best Small Installation",
      ][i % 8],
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

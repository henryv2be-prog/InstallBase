import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getAdminUsersPage(options: {
  q?: string;
  role?: string;
  suspended?: string;
  page?: number;
  pageSize?: number;
}) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 25));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (options.q?.trim()) {
    const q = options.q.trim();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { listing: { displayName: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (options.role === "ADMIN" || options.role === "PROVIDER") {
    where.role = options.role;
  }
  if (options.suspended === "true") where.suspended = true;
  if (options.suspended === "false") where.suspended = false;

  const [total, rows] = await Promise.all([
    kf.kfUser.count({ where }),
    kf.kfUser.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        listing: { select: { id: true, displayName: true, status: true, moderationStatus: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      suspended: u.suspended,
      createdAt: u.createdAt.toISOString(),
      lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
      listing: u.listing
        ? {
            id: u.listing.id,
            displayName: u.listing.displayName,
            status: u.listing.status,
            moderationStatus: u.listing.moderationStatus,
          }
        : null,
    })),
  };
}

export async function getAdminUserDetail(userId: string) {
  const kf = getKasiFindPrisma();
  const user = await kf.kfUser.findUnique({
    where: { id: userId },
    include: {
      listing: {
        select: {
          id: true,
          displayName: true,
          status: true,
          moderationStatus: true,
          featured: true,
          locationLabel: true,
          updatedAt: true,
          _count: { select: { reviews: true, reports: true } },
        },
      },
      listingAssistanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, status: true, createdAt: true },
      },
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    suspended: user.suspended,
    createdAt: user.createdAt.toISOString(),
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
    listing: user.listing
      ? {
          id: user.listing.id,
          displayName: user.listing.displayName,
          status: user.listing.status,
          moderationStatus: user.listing.moderationStatus,
          featured: user.listing.featured,
          locationLabel: user.listing.locationLabel,
          updatedAt: user.listing.updatedAt.toISOString(),
          reviewCount: user.listing._count.reviews,
          reportCount: user.listing._count.reports,
        }
      : null,
    latestAssistance: user.listingAssistanceRequests[0]
      ? {
          id: user.listingAssistanceRequests[0].id,
          status: user.listingAssistanceRequests[0].status,
          createdAt: user.listingAssistanceRequests[0].createdAt.toISOString(),
        }
      : null,
  };
}

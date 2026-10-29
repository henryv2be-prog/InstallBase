import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getAdminListingsPage(options: {
  q?: string;
  status?: string;
  moderation?: string;
  page?: number;
  pageSize?: number;
}) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 25));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (options.q?.trim()) {
    where.displayName = { contains: options.q.trim(), mode: "insensitive" };
  }
  if (options.status === "DRAFT" || options.status === "PUBLISHED" || options.status === "DISABLED") {
    where.status = options.status;
  }
  if (
    options.moderation === "PENDING" ||
    options.moderation === "APPROVED" ||
    options.moderation === "REJECTED"
  ) {
    where.moderationStatus = options.moderation;
  }

  const [total, rows] = await Promise.all([
    kf.kfProviderListing.count({ where }),
    kf.kfProviderListing.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        user: { select: { email: true, name: true } },
        categories: { include: { category: { select: { name: true } } } },
      },
    }),
  ]);

  const ids = rows.map((r) => r.id);
  const viewCounts = ids.length
    ? await kf.kfAnalyticsEvent.groupBy({
        by: ["listingId"],
        _count: { _all: true },
        where: { listingId: { in: ids }, eventType: "LISTING_VIEW" },
      })
    : [];
  const clickCounts = ids.length
    ? await kf.kfAnalyticsEvent.groupBy({
        by: ["listingId"],
        _count: { _all: true },
        where: {
          listingId: { in: ids },
          eventType: {
            in: ["LISTING_CLICK_WHATSAPP", "LISTING_CLICK_CALL", "LISTING_CLICK_DIRECTIONS"],
          },
        },
      })
    : [];

  const viewsById = new Map(viewCounts.map((v) => [v.listingId, v._count._all]));
  const clicksById = new Map(clickCounts.map((v) => [v.listingId, v._count._all]));

  return {
    total,
    page,
    pageSize,
    rows: rows.map((r) => ({
      id: r.id,
      displayName: r.displayName,
      status: r.status,
      moderationStatus: r.moderationStatus,
      featured: r.featured,
      ownerEmail: r.user.email,
      ownerName: r.user.name,
      categories: r.categories.map((c) => c.category.name).join(", "),
      views: viewsById.get(r.id) ?? 0,
      clicks: clicksById.get(r.id) ?? 0,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  };
}

export async function getAdminListingDetail(id: string) {
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true, role: true, suspended: true } },
      categories: { include: { category: true } },
      services: true,
      photos: { orderBy: { sortOrder: "asc" } },
      _count: { select: { reviews: true, reports: true } },
    },
  });
  if (!listing) return null;

  const [views, clicks, recentEvents] = await Promise.all([
    kf.kfAnalyticsEvent.count({ where: { listingId: id, eventType: "LISTING_VIEW" } }),
    kf.kfAnalyticsEvent.count({
      where: {
        listingId: id,
        eventType: {
          in: ["LISTING_CLICK_WHATSAPP", "LISTING_CLICK_CALL", "LISTING_CLICK_DIRECTIONS"],
        },
      },
    }),
    kf.kfAnalyticsEvent.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    listing,
    metrics: { views, clicks, conversion: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0 },
    recentEvents,
  };
}

import "server-only";
import { kfDateKeyInSast } from "@/lib/kasifind/format-datetime";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { isListingClickEvent } from "@/lib/kasifind/analytics";

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getAdminDashboardStats() {
  const kf = getKasiFindPrisma();
  const now = new Date();
  const weekAgo = daysAgo(7);
  const monthAgo = daysAgo(30);

  const [
    totalUsers,
    totalProviders,
    publishedListings,
    pendingListings,
    draftListings,
    featuredListings,
    signupsWeek,
    signupsMonth,
    openReports,
  ] = await Promise.all([
    kf.kfUser.count(),
    kf.kfUser.count({ where: { role: "PROVIDER" } }),
    kf.kfProviderListing.count({
      where: { status: "PUBLISHED", moderationStatus: "APPROVED" },
    }),
    kf.kfProviderListing.count({ where: { moderationStatus: "PENDING" } }),
    kf.kfProviderListing.count({ where: { status: "DRAFT" } }),
    kf.kfProviderListing.count({ where: { featured: true } }),
    kf.kfUser.count({ where: { createdAt: { gte: weekAgo } } }),
    kf.kfUser.count({ where: { createdAt: { gte: monthAgo } } }),
    kf.kfReport.count({ where: { resolved: false } }),
  ]);

  const viewEvents = await kf.kfAnalyticsEvent.groupBy({
    by: ["eventType"],
    _count: { _all: true },
    where: { eventType: "LISTING_VIEW" },
  });
  const totalViews = viewEvents[0]?._count._all ?? 0;

  const clicks = await kf.kfAnalyticsEvent.findMany({
    where: {
      eventType: {
        in: ["LISTING_CLICK_WHATSAPP", "LISTING_CLICK_CALL", "LISTING_CLICK_DIRECTIONS"],
      },
    },
    select: { eventType: true, createdAt: true, userId: true },
  });
  const totalClicks = clicks.length;

  const viewsLast7 = await kf.kfAnalyticsEvent.count({
    where: { eventType: "LISTING_VIEW", createdAt: { gte: weekAgo } },
  });
  const viewsLast30 = await kf.kfAnalyticsEvent.count({
    where: { eventType: "LISTING_VIEW", createdAt: { gte: monthAgo } },
  });
  const clicksLast7 = clicks.filter((c) => c.createdAt >= weekAgo).length;
  const clicksLast30 = clicks.filter((c) => c.createdAt >= monthAgo).length;

  const registeredViews = await kf.kfAnalyticsEvent.count({
    where: { eventType: "LISTING_VIEW", userId: { not: null } },
  });
  const anonymousViews = totalViews - registeredViews;

  const registeredClicks = clicks.filter((c) => c.userId).length;
  const anonymousClicks = totalClicks - registeredClicks;

  const dailyActivity = await kf.kfAnalyticsEvent.findMany({
    where: { createdAt: { gte: daysAgo(14) } },
    select: { eventType: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap = new Map<string, { views: number; clicks: number }>();
  for (const row of dailyActivity) {
    const key = kfDateKeyInSast(row.createdAt);
    const bucket = dailyMap.get(key) ?? { views: 0, clicks: 0 };
    if (row.eventType === "LISTING_VIEW") bucket.views += 1;
    else if (isListingClickEvent(row.eventType)) bucket.clicks += 1;
    dailyMap.set(key, bucket);
  }
  const dailySeries = [...dailyMap.entries()].map(([date, v]) => ({
    date,
    views: v.views,
    clicks: v.clicks,
  }));

  const signups = await kf.kfUser.findMany({
    where: { createdAt: { gte: daysAgo(30) } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const signupMap = new Map<string, number>();
  for (const u of signups) {
    const key = kfDateKeyInSast(u.createdAt);
    signupMap.set(key, (signupMap.get(key) ?? 0) + 1);
  }
  const signupSeries = [...signupMap.entries()].map(([date, count]) => ({ date, count }));

  const topListingsRaw = await kf.kfAnalyticsEvent.groupBy({
    by: ["listingId"],
    _count: { _all: true },
    where: { eventType: "LISTING_VIEW", listingId: { not: null } },
    orderBy: { _count: { listingId: "desc" } },
    take: 8,
  });
  const listingIds = topListingsRaw
    .map((r) => r.listingId)
    .filter((id): id is string => Boolean(id));
  const listingNames = listingIds.length
    ? await kf.kfProviderListing.findMany({
        where: { id: { in: listingIds } },
        select: { id: true, displayName: true },
      })
    : [];
  const nameById = new Map(listingNames.map((l) => [l.id, l.displayName]));
  const topListings = topListingsRaw.map((r) => ({
    id: r.listingId!,
    name: nameById.get(r.listingId!) ?? "Unknown",
    views: r._count._all,
  }));

  const categoryClicks = await kf.kfAnalyticsEvent.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
    where: {
      categoryId: { not: null },
      eventType: { in: ["CATEGORY_BROWSE", "SEARCH"] },
    },
    orderBy: { _count: { categoryId: "desc" } },
    take: 8,
  });
  const catIds = categoryClicks
    .map((c) => c.categoryId)
    .filter((id): id is string => Boolean(id));
  const cats = catIds.length
    ? await kf.kfCategory.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } })
    : [];
  const catName = new Map(cats.map((c) => [c.id, c.name]));
  const clicksByCategory = categoryClicks.map((c) => ({
    id: c.categoryId!,
    name: catName.get(c.categoryId!) ?? "Other",
    count: c._count._all,
  }));

  const regionRows = await kf.kfAnalyticsEvent.groupBy({
    by: ["regionLabel"],
    _count: { _all: true },
    where: { regionLabel: { not: null }, createdAt: { gte: monthAgo } },
    orderBy: { _count: { regionLabel: "desc" } },
    take: 6,
  });
  const geoActivity = regionRows.map((r) => ({
    region: r.regionLabel ?? "Unknown",
    events: r._count._all,
  }));

  const recentActivity = await kf.kfAnalyticsEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    include: {
      listing: { select: { displayName: true } },
      user: { select: { email: true } },
    },
  });

  const conversionRate =
    totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;

  return {
    generatedAt: now.toISOString(),
    cards: {
      totalUsers,
      totalProviders,
      publishedListings,
      pendingListings,
      draftListings,
      featuredListings,
      signupsWeek,
      signupsMonth,
      openReports,
      totalViews,
      totalClicks,
      viewsLast7,
      viewsLast30,
      clicksLast7,
      clicksLast30,
      registeredViews,
      anonymousViews,
      registeredClicks,
      anonymousClicks,
      conversionRate,
    },
    charts: {
      dailySeries,
      signupSeries,
      topListings,
      clicksByCategory,
      geoActivity,
    },
    recentActivity: recentActivity.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      listingName: e.listing?.displayName ?? null,
      userEmail: e.user?.email ?? null,
      visitorId: e.visitorId.slice(0, 8),
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export type AdminDashboardStats = Awaited<ReturnType<typeof getAdminDashboardStats>>;

import "server-only";
import { getAdminAssistanceSummary } from "@/lib/kasifind/listing-assistance";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { withAnalyticsAudience } from "@/lib/kasifind/analytics-audience";
function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export type WeekOverWeek = {
  current: number;
  previous: number;
  /** null when previous is 0 (avoid misleading %). */
  changePercent: number | null;
};

function weekOverWeek(current: number, previous: number): WeekOverWeek {
  const changePercent =
    previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;
  return { current, previous, changePercent };
}

export async function getAdminInboxQueueCounts() {
  const kf = getKasiFindPrisma();
  const assistance = await getAdminAssistanceSummary();

  const [pendingModeration, openReports, draftListings] = await Promise.all([
    kf.kfProviderListing.count({
      where: {
        moderationStatus: "PENDING",
        status: { in: ["PUBLISHED", "DRAFT"] },
      },
    }),
    kf.kfReport.count({ where: { resolved: false } }),
    kf.kfProviderListing.count({ where: { status: "DRAFT" } }),
  ]);

  return {
    assistance,
    pendingModeration,
    openReports,
    /** Providers still editing — not yet published (existing status definition). */
    draftListings,
  };
}

export async function getAdminInboxGrowthKpis() {
  const kf = getKasiFindPrisma();
  const weekAgo = daysAgo(7);
  const prevWeekStart = daysAgo(14);

  const [
    totalProviders,
    publishedListings,
    newProvidersWeek,
    newProvidersPrevWeek,
    newListingsWeek,
    newListingsPrevWeek,
    viewsWeek,
    viewsPrevWeek,
    clicksWeek,
    clicksPrevWeek,
  ] = await Promise.all([
    kf.kfUser.count({ where: { role: "PROVIDER" } }),
    kf.kfProviderListing.count({
      where: { status: "PUBLISHED", moderationStatus: "APPROVED" },
    }),
    kf.kfUser.count({
      where: { role: "PROVIDER", createdAt: { gte: weekAgo } },
    }),
    kf.kfUser.count({
      where: { role: "PROVIDER", createdAt: { gte: prevWeekStart, lt: weekAgo } },
    }),
    kf.kfProviderListing.count({ where: { createdAt: { gte: weekAgo } } }),
    kf.kfProviderListing.count({
      where: { createdAt: { gte: prevWeekStart, lt: weekAgo } },
    }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({
        eventType: "LISTING_VIEW",
        createdAt: { gte: weekAgo },
      }),
    }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({
        eventType: "LISTING_VIEW",
        createdAt: { gte: prevWeekStart, lt: weekAgo },
      }),
    }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({
        eventType: {
          in: ["LISTING_CLICK_WHATSAPP", "LISTING_CLICK_CALL", "LISTING_CLICK_DIRECTIONS"],
        },
        createdAt: { gte: weekAgo },
      }),
    }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({
        eventType: {
          in: ["LISTING_CLICK_WHATSAPP", "LISTING_CLICK_CALL", "LISTING_CLICK_DIRECTIONS"],
        },
        createdAt: { gte: prevWeekStart, lt: weekAgo },
      }),
    }),
  ]);

  return {
    totalProviders,
    publishedListings,
    newProviders: weekOverWeek(newProvidersWeek, newProvidersPrevWeek),
    newListings: weekOverWeek(newListingsWeek, newListingsPrevWeek),
    listingViews: weekOverWeek(viewsWeek, viewsPrevWeek),
    contactClicks: weekOverWeek(clicksWeek, clicksPrevWeek),
  };
}

export async function getAdminInboxPlatformHighlights() {
  const kf = getKasiFindPrisma();
  const weekAgo = daysAgo(7);

  const [newProviders, newListings, viewsWeek, contactWeek, searchesWeek] = await Promise.all([
    kf.kfUser.count({ where: { role: "PROVIDER", createdAt: { gte: weekAgo } } }),
    kf.kfProviderListing.count({ where: { createdAt: { gte: weekAgo } } }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({ eventType: "LISTING_VIEW", createdAt: { gte: weekAgo } }),
    }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({
        eventType: {
          in: ["LISTING_CLICK_WHATSAPP", "LISTING_CLICK_CALL", "LISTING_CLICK_DIRECTIONS"],
        },
        createdAt: { gte: weekAgo },
      }),
    }),
    kf.kfAnalyticsEvent.count({
      where: withAnalyticsAudience({ eventType: "SEARCH", createdAt: { gte: weekAgo } }),
    }),
  ]);

  return { newProviders, newListings, viewsWeek, contactWeek, searchesWeek };
}
import "server-only";
import { LISTING_CONTACT_CLICK_TYPES } from "@/lib/kasifind/contact-click-display";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  analyticsCreatedAtFilter,
  type ProviderReportPeriodRange,
} from "@/lib/kasifind/provider-performance-report-period";
import type { ProviderPerformanceReportMetrics } from "@/lib/kasifind/provider-performance-report-types";

const CONTACT_CLICK_TYPES = LISTING_CONTACT_CLICK_TYPES.filter(
  (t) => t !== "LISTING_CLICK_DIRECTIONS"
);

export type { ProviderPerformanceReportMetrics } from "@/lib/kasifind/provider-performance-report-types";

export async function getProviderPerformanceReportMetrics(
  listingId: string,
  period: ProviderReportPeriodRange
): Promise<ProviderPerformanceReportMetrics | null> {
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({
    where: { id: listingId },
    select: { id: true, displayName: true },
  });
  if (!listing) return null;

  const createdAt = analyticsCreatedAtFilter(period);
  const listingWhere = { listingId, createdAt };

  const [impressions, profileViews, contactClicks, directionsClicks, reviewAgg] = await Promise.all([
    kf.kfAnalyticsEvent.count({
      where: { ...listingWhere, eventType: "LISTING_IMPRESSION" },
    }),
    kf.kfAnalyticsEvent.count({
      where: { ...listingWhere, eventType: "LISTING_VIEW" },
    }),
    kf.kfAnalyticsEvent.count({
      where: {
        ...listingWhere,
        eventType: { in: [...CONTACT_CLICK_TYPES] },
      },
    }),
    kf.kfAnalyticsEvent.count({
      where: { ...listingWhere, eventType: "LISTING_CLICK_DIRECTIONS" },
    }),
    kf.kfReview.aggregate({
      where: { listingId, hidden: false },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const avgRaw = reviewAgg._avg.rating;
  const averageRating =
    avgRaw === null || reviewAgg._count._all === 0 ? null : Math.round(avgRaw * 10) / 10;

  return {
    listingId: listing.id,
    businessName: listing.displayName,
    periodLabel: period.label,
    impressions,
    profileViews,
    contactClicks,
    directionsClicks,
    averageRating,
    reviewCount: reviewAgg._count._all,
    trackingNotes: [
      "Impressions and views are total tracked events (not unique visitors).",
      "Customer rating reflects all visible reviews on the listing (not limited to the selected period).",
    ],
  };
}


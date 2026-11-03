import "server-only";
import { LISTING_CONTACT_CLICK_TYPES } from "@/lib/kasifind/contact-click-display";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getListingEngagementMetrics(listingId: string) {
  const kf = getKasiFindPrisma();
  const [impressions, profileViews, clicks] = await Promise.all([
    kf.kfAnalyticsEvent.count({
      where: { listingId, eventType: "LISTING_IMPRESSION" },
    }),
    kf.kfAnalyticsEvent.count({
      where: { listingId, eventType: "LISTING_VIEW" },
    }),
    kf.kfAnalyticsEvent.count({
      where: { listingId, eventType: { in: [...LISTING_CONTACT_CLICK_TYPES] } },
    }),
  ]);

  const profileOpenRate =
    impressions > 0 ? Math.round((profileViews / impressions) * 1000) / 10 : 0;
  const contactRate =
    profileViews > 0 ? Math.round((clicks / profileViews) * 1000) / 10 : 0;

  return {
    impressions,
    profileViews,
    clicks,
    profileOpenRate,
    contactRate,
  };
}

import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  formatKfClickIdentity,
  formatKfContactClickLabel,
  LISTING_CONTACT_CLICK_TYPES,
} from "@/lib/kasifind/contact-click-display";

export {
  formatKfClickIdentity,
  formatKfClickVisitorSuffix,
  formatKfContactClickLabel,
  LISTING_CONTACT_CLICK_TYPES,
} from "@/lib/kasifind/contact-click-display";

export async function getListingContactClickLog(
  listingId: string,
  options?: { limit?: number }
) {
  const limit = Math.min(200, Math.max(1, options?.limit ?? 100));
  const kf = getKasiFindPrisma();

  const rows = await kf.kfAnalyticsEvent.findMany({
    where: {
      listingId,
      eventType: { in: [...LISTING_CONTACT_CLICK_TYPES] },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return rows.map((e) => {
    const identity = formatKfClickIdentity({
      userName: e.user?.name ?? null,
      userEmail: e.user?.email ?? null,
      visitorId: e.visitorId,
    });
    return {
      id: e.id,
      eventType: e.eventType,
      contactLabel: formatKfContactClickLabel(e.eventType),
      createdAt: e.createdAt.toISOString(),
      userId: e.userId,
      visitorId: e.visitorId,
      identityLabel: identity.label,
      identityDetail: identity.detail,
      isRegisteredUser: Boolean(e.userId),
    };
  });
}

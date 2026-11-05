import type { KfAnalyticsEventType } from "@/generated/prisma/enums";
import { formatKfContactClickLabel } from "@/lib/kasifind/contact-click-display";

export function formatAdminEventTypeLabel(eventType: KfAnalyticsEventType): string {
  switch (eventType) {
    case "LISTING_IMPRESSION":
      return "Listing impression";
    case "LISTING_VIEW":
      return "Profile view";
    case "LISTING_CLICK_WHATSAPP":
    case "LISTING_CLICK_CALL":
    case "LISTING_CLICK_DIRECTIONS":
      return formatKfContactClickLabel(eventType);
    case "SEARCH":
      return "Search";
    case "CATEGORY_BROWSE":
      return "Category browse";
    default: {
      const _exhaustive: never = eventType;
      return String(_exhaustive).replace(/_/g, " ");
    }
  }
}

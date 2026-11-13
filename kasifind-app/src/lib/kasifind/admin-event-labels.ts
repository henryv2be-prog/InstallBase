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
    case "LISTING_SHARE":
      return "Listing shared";
    case "LISTING_NEARBY_SECTION_VIEW":
      return "Nearby section viewed";
    case "LISTING_DISCOVERY_CLICK":
      return "Opened from listing discovery";
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

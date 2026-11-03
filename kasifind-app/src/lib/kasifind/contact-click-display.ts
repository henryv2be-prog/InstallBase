import type { KfAnalyticsEventType } from "@/generated/prisma/enums";

export const LISTING_CONTACT_CLICK_TYPES = [
  "LISTING_CLICK_WHATSAPP",
  "LISTING_CLICK_CALL",
  "LISTING_CLICK_DIRECTIONS",
] as const satisfies readonly KfAnalyticsEventType[];

export type ListingContactClickType = (typeof LISTING_CONTACT_CLICK_TYPES)[number];

export function formatKfContactClickLabel(eventType: KfAnalyticsEventType): string {
  switch (eventType) {
    case "LISTING_CLICK_WHATSAPP":
      return "WhatsApp";
    case "LISTING_CLICK_CALL":
      return "Phone call";
    case "LISTING_CLICK_DIRECTIONS":
      return "Directions";
    default:
      return eventType.replace(/_/g, " ");
  }
}

export function formatKfClickVisitorSuffix(visitorId: string): string {
  const trimmed = visitorId.trim();
  if (trimmed.length <= 8) return trimmed;
  return trimmed.slice(0, 8);
}

export function formatKfClickIdentity(input: {
  userName: string | null;
  userEmail: string | null;
  visitorId: string;
}): { label: string; detail: string | null } {
  if (input.userEmail) {
    const name = input.userName?.trim();
    return {
      label: name ? `${name} (${input.userEmail})` : input.userEmail,
      detail: `Visitor ID …${formatKfClickVisitorSuffix(input.visitorId)}`,
    };
  }
  return {
    label: `Anonymous visitor …${formatKfClickVisitorSuffix(input.visitorId)}`,
    detail: `Full visitor ID: ${input.visitorId}`,
  };
}

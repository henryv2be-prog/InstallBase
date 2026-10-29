"use client";

export type ClientAnalyticsEvent =
  | "LISTING_VIEW"
  | "LISTING_CLICK_WHATSAPP"
  | "LISTING_CLICK_CALL"
  | "LISTING_CLICK_DIRECTIONS"
  | "SEARCH"
  | "CATEGORY_BROWSE";

export function trackKfEvent(
  eventType: ClientAnalyticsEvent,
  payload?: {
    listingId?: string;
    categoryId?: string;
    query?: string;
    regionLabel?: string;
  }
) {
  const body = JSON.stringify({ eventType, ...payload });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/event", blob);
    return;
  }
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

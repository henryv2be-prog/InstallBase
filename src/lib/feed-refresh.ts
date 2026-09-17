export const FEED_REFRESH_EVENT = "installbase:feed-refresh";

export function requestFeedReset() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FEED_REFRESH_EVENT));
}

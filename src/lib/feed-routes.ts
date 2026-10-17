/** Mobile default is the vertical “New look” feed at /feed/watch; classic lives at /feed?view=classic. */

export function isMobileUserAgent(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    userAgent
  );
}

export function newLookFeedHref(tab?: "popular" | "following"): string {
  if (tab === "following") return "/feed/watch?tab=following";
  if (tab === "popular") return "/feed/watch?tab=popular";
  return "/feed/watch";
}

export function classicFeedHref(tab?: "popular" | "following"): string {
  const base = "/feed?view=classic";
  if (tab === "following") return `${base}&tab=following`;
  if (tab === "popular") return `${base}&tab=popular`;
  return base;
}

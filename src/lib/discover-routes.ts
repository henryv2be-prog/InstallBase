/** Mobile default for Trending is vertical New look at /discover/watch; classic grid at /discover?view=classic. */

export function newLookExploreHref(): string {
  return "/discover/watch";
}

export function classicExploreHref(tab?: string): string {
  const base = "/discover?view=classic";
  if (tab && tab !== "trending") return `${base}&tab=${tab}`;
  return base;
}

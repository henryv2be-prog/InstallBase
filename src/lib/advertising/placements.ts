/** Central registry of ad placement keys. */
export const AD_PLACEMENTS = {
  FEED_TOP: "feed_top",
  FEED_BETWEEN_POSTS: "feed_between_posts",
  FEED_SIDEBAR: "feed_sidebar",
  HOMEPAGE: "homepage",
  COMMUNITY: "community",
  SEARCH_RESULTS: "search_results",
  MARKETPLACE: "marketplace",
  SUPPLIER: "supplier",
  ARTICLE: "article",
  JOB: "job",
  DASHBOARD: "dashboard",
  MOBILE_FEED: "mobile_feed",
  DESKTOP_SIDEBAR: "desktop_sidebar",
  HEADER_BANNER: "header_banner",
} as const;

export type AdPlacementKey = (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS];

export const PLACEMENT_LABELS: Record<AdPlacementKey, string> = {
  feed_top: "Feed Top",
  feed_between_posts: "Feed Between Posts",
  feed_sidebar: "Feed Sidebar",
  homepage: "Homepage",
  community: "Community",
  search_results: "Search Results",
  marketplace: "Marketplace",
  supplier: "Supplier Pages",
  article: "Article Pages",
  job: "Job Pages",
  dashboard: "Dashboard",
  mobile_feed: "Mobile Feed",
  desktop_sidebar: "Desktop Sidebar",
  header_banner: "Header Banner",
};

export const ALL_PLACEMENT_KEYS = Object.values(AD_PLACEMENTS);

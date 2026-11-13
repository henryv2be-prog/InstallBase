/** Anonymous session attribution for listing → listing and share funnels. */

const KEY = "kf_listing_entry_v1";

export type ListingEntrySource = "direct" | "share" | "nearby" | "category";

export type ListingEntryAttribution = {
  source: ListingEntrySource;
  fromListingId?: string;
};

export function markListingEntry(source: ListingEntrySource, fromListingId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ListingEntryAttribution = { source };
    if (fromListingId) payload.fromListingId = fromListingId;
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function consumeListingEntry(): ListingEntryAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as ListingEntryAttribution;
    if (!parsed?.source) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function formatListingViewAttribution(entry: ListingEntryAttribution | null): {
  query?: string;
  regionLabel?: string;
} {
  if (!entry) return { query: "entry:direct" };
  const query = `entry:${entry.source}`;
  const regionLabel = entry.fromListingId ? `from:${entry.fromListingId}` : undefined;
  return { query, regionLabel };
}

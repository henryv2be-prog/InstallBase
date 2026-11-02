let activeScopeKey = "";
const seenListingIds = new Set<string>();

/** Reset dedupe when search results / filters change. */
export function setListingImpressionScope(scopeKey: string) {
  if (scopeKey === activeScopeKey) return;
  activeScopeKey = scopeKey;
  seenListingIds.clear();
}

export function shouldTrackListingImpression(scopeKey: string, listingId: string): boolean {
  if (scopeKey !== activeScopeKey) {
    setListingImpressionScope(scopeKey);
  }
  const key = `${scopeKey}:${listingId}`;
  if (seenListingIds.has(key)) return false;
  seenListingIds.add(key);
  return true;
}

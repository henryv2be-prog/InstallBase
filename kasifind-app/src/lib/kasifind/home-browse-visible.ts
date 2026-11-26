import {
  BROWSE_INITIAL_VISIBLE_COUNT,
  BROWSE_LOAD_MORE_BATCH,
} from "@/lib/kasifind/discovery-config";

/** First paint card count (capped by total results). */
export function initialHomeBrowseVisibleCount(
  totalResults: number,
  initial = BROWSE_INITIAL_VISIBLE_COUNT
): number {
  if (!Number.isFinite(totalResults) || totalResults <= 0) return 0;
  return Math.min(Math.max(0, Math.floor(initial)), totalResults);
}

/** After Load more — never exceeds total. */
export function nextHomeBrowseVisibleCount(
  currentVisible: number,
  totalResults: number,
  batch = BROWSE_LOAD_MORE_BATCH
): number {
  const total = Math.max(0, Math.floor(totalResults));
  const current = Math.max(0, Math.floor(currentVisible));
  const step = Math.max(1, Math.floor(batch));
  if (current >= total) return total;
  return Math.min(total, current + step);
}

/**
 * Reveal enough cards to include `listingIndex` (0-based), aligned to initial + batch steps.
 * Used when restoring scroll to a listing below the first page of cards.
 */
export function visibleCountForListingIndex(
  listingIndex: number,
  totalResults: number,
  initial = BROWSE_INITIAL_VISIBLE_COUNT,
  batch = BROWSE_LOAD_MORE_BATCH
): number {
  const total = Math.max(0, Math.floor(totalResults));
  if (total === 0) return 0;
  const idx = Math.floor(listingIndex);
  if (idx < 0) return initialHomeBrowseVisibleCount(total, initial);

  const need = idx + 1;
  const base = initialHomeBrowseVisibleCount(total, initial);
  if (need <= base) return base;

  const beyond = need - base;
  const step = Math.max(1, Math.floor(batch));
  const extraBatches = Math.ceil(beyond / step);
  return Math.min(total, base + extraBatches * step);
}

export function homeBrowseRemainingCount(visible: number, total: number): number {
  const t = Math.max(0, Math.floor(total));
  const v = Math.max(0, Math.floor(visible));
  return Math.max(0, t - v);
}
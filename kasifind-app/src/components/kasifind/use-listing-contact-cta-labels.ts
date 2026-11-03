"use client";

import { useMemo } from "react";
import { assignListingContactCtaPhrases } from "@/lib/kasifind/contact-cta-phrases";

/**
 * Stable humorous CTA labels for the current result set. Re-randomises when
 * scopeKey changes (new search, filters, location, or page refresh remount).
 */
export function useListingContactCtaLabels(
  listingIds: readonly string[],
  scopeKey: string | null
): ReadonlyMap<string, string> {
  const idsKey = listingIds.join(",");

  return useMemo(() => {
    if (!scopeKey || listingIds.length === 0) {
      return new Map<string, string>();
    }
    return assignListingContactCtaPhrases(listingIds);
  }, [scopeKey, idsKey, listingIds]);
}

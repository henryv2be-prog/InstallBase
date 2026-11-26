"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  assignListingContactCtaPhrases,
  assignListingContactCtaPhrasesForHydration,
} from "@/lib/kasifind/contact-cta-phrases";
import {
  contactCtaSessionStorageKey,
  readContactCtaSessionMap,
  writeContactCtaSessionMap,
} from "@/lib/kasifind/contact-cta-session";

const EMPTY = new Map<string, string>();

/**
 * Humorous CTA labels per listing. SSR and the first client paint use a
 * deterministic assignment; after hydration a random assignment is applied once
 * per scope (persisted in sessionStorage for stability within the tab).
 */
export function useListingContactCtaLabels(
  listingIds: readonly string[],
  scopeKey: string | null
): ReadonlyMap<string, string> {
  const idsKey = listingIds.join(",");

  const hydrationLabels = useMemo(() => {
    if (!scopeKey || listingIds.length === 0) return EMPTY;
    return assignListingContactCtaPhrasesForHydration(listingIds, scopeKey);
  }, [scopeKey, idsKey, listingIds]);

  const [labels, setLabels] = useState(hydrationLabels);

  useLayoutEffect(() => {
    setLabels(hydrationLabels);
  }, [hydrationLabels]);

  useEffect(() => {
    if (!scopeKey || listingIds.length === 0) return;

    const storageKey = contactCtaSessionStorageKey(scopeKey);
    const fromSession = readContactCtaSessionMap(storageKey, listingIds);
    if (fromSession) {
      setLabels(fromSession);
      return;
    }

    const shuffled = assignListingContactCtaPhrases(listingIds, Math.random);
    setLabels(shuffled);
    writeContactCtaSessionMap(storageKey, shuffled);
  }, [scopeKey, idsKey, listingIds]);

  return labels;
}
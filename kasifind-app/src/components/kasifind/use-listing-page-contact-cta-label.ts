"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assignListingContactCtaPhrases,
  assignListingContactCtaPhrasesForHydration,
} from "@/lib/kasifind/contact-cta-phrases";

/** Stable hydration + client random phrase for a single listing detail / persistent bar. */
export function useListingPageContactCtaLabel(
  listingId: string,
  contactCtaLabel?: string
): string {
  const hydrationLabel = useMemo(
    () =>
      assignListingContactCtaPhrasesForHydration([listingId], `listing:${listingId}`).get(listingId) ??
      "",
    [listingId]
  );
  const [randomFallback, setRandomFallback] = useState<string | null>(null);

  useEffect(() => {
    if (contactCtaLabel) return;
    setRandomFallback(
      assignListingContactCtaPhrases([listingId], Math.random).get(listingId) ?? hydrationLabel
    );
  }, [contactCtaLabel, listingId, hydrationLabel]);

  return contactCtaLabel ?? randomFallback ?? hydrationLabel;
}
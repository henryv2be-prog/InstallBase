"use client";

import { useEffect, useRef } from "react";
import { shouldTrackListingImpression } from "@/lib/kasifind/listing-impression-scope";
import { trackKfEvent } from "@/lib/kasifind/track-client";

const VISIBILITY_RATIO = 0.5;
const DWELL_MS = 400;

/**
 * Fires LISTING_IMPRESSION once per listing per search-results scope when the card
 * is at least half visible in the viewport for a short dwell time.
 */
export function useKfListingImpression(
  listingId: string,
  impressionScopeKey: string | null
) {
  const rootRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!impressionScopeKey) return;
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let fired = false;

    const clearDwell = () => {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
        dwellTimer = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || fired) return;

        if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_RATIO) {
          if (!dwellTimer) {
            dwellTimer = setTimeout(() => {
              dwellTimer = null;
              if (fired) return;
              if (!shouldTrackListingImpression(impressionScopeKey, listingId)) {
                fired = true;
                return;
              }
              fired = true;
              trackKfEvent("LISTING_IMPRESSION", { listingId });
            }, DWELL_MS);
          }
        } else {
          clearDwell();
        }
      },
      { threshold: [0, VISIBILITY_RATIO, 1] }
    );

    observer.observe(node);
    return () => {
      clearDwell();
      observer.disconnect();
    };
  }, [listingId, impressionScopeKey]);

  return rootRef;
}

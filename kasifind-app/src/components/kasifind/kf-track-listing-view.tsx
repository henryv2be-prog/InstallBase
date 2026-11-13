"use client";

import { useEffect, useRef } from "react";
import { trackKfEvent } from "@/lib/kasifind/track-client";
import {
  consumeListingEntry,
  formatListingViewAttribution,
} from "@/lib/kasifind/listing-page-attribution";

export function KfTrackListingView({ listingId }: { listingId: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const entry = consumeListingEntry();
    const attribution = formatListingViewAttribution(entry);
    trackKfEvent("LISTING_VIEW", { listingId, ...attribution });
  }, [listingId]);
  return null;
}

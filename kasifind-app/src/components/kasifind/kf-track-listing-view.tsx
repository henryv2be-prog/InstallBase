"use client";

import { useEffect, useRef } from "react";
import { trackKfEvent } from "@/lib/kasifind/track-client";

export function KfTrackListingView({ listingId }: { listingId: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackKfEvent("LISTING_VIEW", { listingId });
  }, [listingId]);
  return null;
}

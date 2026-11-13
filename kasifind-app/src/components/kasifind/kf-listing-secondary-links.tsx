"use client";

import Link from "next/link";
import { MapPin, MessageSquare, Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useKfToast } from "@/components/kasifind/kf-toast";
import { shareProviderListing } from "@/lib/kasifind/share-provider-listing";
import { markListingEntry } from "@/lib/kasifind/listing-page-attribution";
import { trackKfEvent } from "@/lib/kasifind/track-client";

type Props = {
  listingId: string;
  displayName: string;
  hasReviews: boolean;
  hasMap: boolean;
};

export function KfListingSecondaryLinks({
  listingId,
  displayName,
  hasReviews,
  hasMap,
}: Props) {
  const toast = useKfToast();
  const [sharing, setSharing] = useState(false);

  const onShare = useCallback(async () => {
    setSharing(true);
    try {
      markListingEntry("share");
      const result = await shareProviderListing({
        listingId,
        displayName,
        origin: window.location.origin,
        audience: "customer",
      });
      if (result.mode === "cancelled") return;
      trackKfEvent("LISTING_SHARE", { listingId, query: "audience:customer" });
      if (result.mode === "clipboard") {
        toast.success("Listing link copied — paste into WhatsApp or chat.");
      } else {
        toast.success("Thanks for sharing this business!");
      }
    } catch {
      toast.error("Could not share this listing.");
    } finally {
      setSharing(false);
    }
  }, [displayName, listingId, toast]);

  return (
    <nav className="kf-listing-secondary-links" aria-label="More actions">
      <button
        type="button"
        className="kf-listing-secondary-link"
        disabled={sharing}
        onClick={() => void onShare()}
      >
        <Share2 className="h-4 w-4 shrink-0" aria-hidden />
        Share this business
      </button>
      {hasMap ? (
        <a href="#kf-listing-map" className="kf-listing-secondary-link">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          View location
        </a>
      ) : null}
      {hasReviews ? (
        <a href="#kf-listing-reviews" className="kf-listing-secondary-link">
          <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
          Customer reviews
        </a>
      ) : (
        <a href="#kf-listing-reviews" className="kf-listing-secondary-link">
          <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
          Leave a review
        </a>
      )}
    </nav>
  );
}

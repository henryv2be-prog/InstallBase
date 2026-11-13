"use client";

import { useCallback, useState } from "react";
import { MessageCircle, Navigation, Phone, Share2 } from "lucide-react";
import { trackKfEvent } from "@/lib/kasifind/track-client";
import { useKfToast } from "@/components/kasifind/kf-toast";
import { shareProviderListing } from "@/lib/kasifind/share-provider-listing";

type Props = {
  listingId: string;
  displayName: string;
  waUrl: string | null;
  callPhone: string;
  directionsUrl: string | null;
  /** Search cards use grouped footer chips; strip is full-bleed legacy layout. */
  variant?: "card" | "strip";
  className?: string;
};

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function KfInlineContactActions({
  listingId,
  displayName,
  waUrl,
  callPhone,
  directionsUrl,
  variant = "card",
  className = "",
}: Props) {
  const toast = useKfToast();
  const [sharing, setSharing] = useState(false);
  const canWhatsApp = Boolean(waUrl);
  const canCall = phoneDigits(callPhone).length >= 9;
  const canDirections = Boolean(directionsUrl);

  const onShare = useCallback(async () => {
    setSharing(true);
    try {
      const result = await shareProviderListing({
        listingId,
        displayName,
        origin: window.location.origin,
        audience: "customer",
      });
      if (result.mode === "clipboard") {
        toast.success("Listing link copied — paste it anywhere.");
      } else if (result.mode === "native_share") {
        toast.success("Thanks for sharing this listing!");
      }
    } catch {
      toast.error("Could not share this listing.");
    } finally {
      setSharing(false);
    }
  }, [displayName, listingId, toast]);

  if (!canWhatsApp && !canCall && !canDirections && !listingId) return null;

  const layoutClass =
    variant === "card" ? "kf-inline-contact-actions--card" : "kf-inline-contact-actions--strip";

  return (
    <div
      className={`kf-inline-contact-actions ${layoutClass}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Contact and share this listing"
    >
      {canWhatsApp && waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="kf-inline-contact-btn kf-inline-contact-btn--wa"
          aria-label="WhatsApp"
          title="WhatsApp"
          onClick={() => trackKfEvent("LISTING_CLICK_WHATSAPP", { listingId })}
        >
          <MessageCircle className="h-[1.125rem] w-[1.125rem]" aria-hidden />
        </a>
      ) : null}
      {canCall ? (
        <a
          href={`tel:${callPhone.replace(/\s/g, "")}`}
          className="kf-inline-contact-btn kf-inline-contact-btn--call"
          aria-label="Call"
          title="Call"
          onClick={() => trackKfEvent("LISTING_CLICK_CALL", { listingId })}
        >
          <Phone className="h-[1.125rem] w-[1.125rem]" aria-hidden />
        </a>
      ) : null}
      {canDirections && directionsUrl ? (
        <a
          href={directionsUrl}
          className="kf-inline-contact-btn kf-inline-contact-btn--directions"
          aria-label="Directions"
          title="Directions"
          onClick={() => trackKfEvent("LISTING_CLICK_DIRECTIONS", { listingId })}
        >
          <Navigation className="h-[1.125rem] w-[1.125rem]" aria-hidden />
        </a>
      ) : null}
      <button
        type="button"
        className="kf-inline-contact-btn kf-inline-contact-btn--share"
        aria-label="Share listing"
        title="Share listing"
        disabled={sharing}
        onClick={() => void onShare()}
      >
        <Share2 className="h-[1.125rem] w-[1.125rem]" aria-hidden />
      </button>
    </div>
  );
}

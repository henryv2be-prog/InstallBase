"use client";

import { MessageCircle, Phone } from "lucide-react";
import { trackKfEvent } from "@/lib/kasifind/track-client";

type Props = {
  listingId: string;
  waUrl: string | null;
  telHref: string | null;
};

export function KfListingPersistentContactBar({ listingId, waUrl, telHref }: Props) {
  const canWhatsApp = Boolean(waUrl);
  const canCall = Boolean(telHref);
  if (!canWhatsApp && !canCall) return null;

  const twoUp = canWhatsApp && canCall;

  return (
    <nav
      className={`kf-listing-persistent-contact grid gap-2${twoUp ? " kf-listing-persistent-contact--split" : ""}`}
      aria-label="Contact this business"
    >
      {canWhatsApp && waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="kf-btn kf-btn-wa kf-listing-persistent-contact-btn"
          onClick={() => trackKfEvent("LISTING_CLICK_WHATSAPP", { listingId })}
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
          WhatsApp
        </a>
      ) : null}
      {canCall && telHref ? (
        <a
          href={telHref}
          className="kf-btn kf-btn-outline kf-listing-persistent-contact-btn"
          onClick={() => trackKfEvent("LISTING_CLICK_CALL", { listingId })}
        >
          <Phone className="h-5 w-5 shrink-0" aria-hidden />
          Call
        </a>
      ) : null}
    </nav>
  );
}
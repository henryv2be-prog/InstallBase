"use client";

import { MessageCircle, Navigation, Phone } from "lucide-react";
import { trackKfEvent } from "@/lib/kasifind/track-client";

type Props = {
  waUrl: string | null;
  phone: string;
  directionsUrl: string;
  listingId?: string;
};

function digits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function KfContactBar({ waUrl, phone, directionsUrl, listingId }: Props) {
  const canCall = digits(phone).length >= 9;
  const canWa = Boolean(waUrl);
  const cols = [canWa, canCall, true].filter(Boolean).length;

  return (
    <div
      className={`kf-sticky-contact kf-contact-bar grid gap-2 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none${cols === 1 ? " grid-cols-1" : cols === 2 ? " grid-cols-2" : " grid-cols-3"}`}
    >
      {canWa && waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="kf-btn kf-btn-wa px-2 text-xs sm:px-4 sm:text-sm"
          onClick={() => {
            if (listingId) trackKfEvent("LISTING_CLICK_WHATSAPP", { listingId });
          }}
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
          WhatsApp
        </a>
      ) : null}
      {canCall ? (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="kf-btn kf-btn-outline px-2 text-xs sm:px-4 sm:text-sm"
          onClick={() => {
            if (listingId) trackKfEvent("LISTING_CLICK_CALL", { listingId });
          }}
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden />
          Call
        </a>
      ) : null}
      <a
        href={directionsUrl}
        className="kf-btn kf-btn-secondary px-2 text-xs sm:px-4 sm:text-sm"
        onClick={() => {
          if (listingId) trackKfEvent("LISTING_CLICK_DIRECTIONS", { listingId });
        }}
      >
        <Navigation className="h-4 w-4 shrink-0" aria-hidden />
        Directions
      </a>
    </div>
  );
}

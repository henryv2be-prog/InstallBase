"use client";

import { MessageCircle, Navigation, Phone } from "lucide-react";
import { trackKfEvent } from "@/lib/kasifind/track-client";

type Props = {
  listingId: string;
  waUrl: string | null;
  callPhone: string;
  directionsUrl: string | null;
  className?: string;
};

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function KfInlineContactActions({
  listingId,
  waUrl,
  callPhone,
  directionsUrl,
  className = "",
}: Props) {
  const canWhatsApp = Boolean(waUrl);
  const canCall = phoneDigits(callPhone).length >= 9;
  const canDirections = Boolean(directionsUrl);

  if (!canWhatsApp && !canCall && !canDirections) return null;

  return (
    <div
      className={`kf-inline-contact-actions${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Contact options"
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
    </div>
  );
}

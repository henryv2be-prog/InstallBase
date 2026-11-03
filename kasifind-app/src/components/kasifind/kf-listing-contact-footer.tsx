"use client";

import { useMemo } from "react";
import { KfInlineContactActions } from "@/components/kasifind/kf-inline-contact-actions";
import { assignListingContactCtaPhrases } from "@/lib/kasifind/contact-cta-phrases";

type Props = {
  listingId: string;
  waUrl: string | null;
  callPhone: string;
  directionsUrl: string | null;
  /** When omitted (e.g. profile page), picks one stable phrase for this listing. */
  contactCtaLabel?: string;
  className?: string;
};

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function hasContactActions(
  waUrl: string | null,
  callPhone: string,
  directionsUrl: string | null
): boolean {
  const canWhatsApp = Boolean(waUrl);
  const canCall = phoneDigits(callPhone).length >= 9;
  const canDirections = Boolean(directionsUrl);
  return canWhatsApp || canCall || canDirections;
}

export function KfListingContactFooter({
  listingId,
  waUrl,
  callPhone,
  directionsUrl,
  contactCtaLabel,
  className = "",
}: Props) {
  const fallbackLabel = useMemo(
    () => assignListingContactCtaPhrases([listingId]).get(listingId) ?? "",
    [listingId]
  );
  const label = contactCtaLabel ?? fallbackLabel;

  if (!hasContactActions(waUrl, callPhone, directionsUrl)) return null;

  return (
    <div className={`kf-provider-card-footer${className ? ` ${className}` : ""}`}>
      {label ? <p className="kf-provider-card-footer-label">{label}</p> : null}
      <KfInlineContactActions
        listingId={listingId}
        waUrl={waUrl}
        callPhone={callPhone}
        directionsUrl={directionsUrl}
        variant="card"
      />
    </div>
  );
}

"use client";

import { KfInlineContactActions } from "@/components/kasifind/kf-inline-contact-actions";

type Props = {
  listingId: string;
  displayName: string;
  waUrl: string | null;
  callPhone: string;
  directionsUrl: string | null;
};

/** Fixed listing contact strip — same four icon actions as the former in-page footer (no CTA copy). */
export function KfListingPersistentContactBar({
  listingId,
  displayName,
  waUrl,
  callPhone,
  directionsUrl,
}: Props) {
  return (
    <nav className="kf-listing-persistent-contact" aria-label="Contact this business">
      <KfInlineContactActions
        listingId={listingId}
        displayName={displayName}
        waUrl={waUrl}
        callPhone={callPhone}
        directionsUrl={directionsUrl}
        variant="card"
        className="kf-listing-persistent-contact-actions"
      />
    </nav>
  );
}
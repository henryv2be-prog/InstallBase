"use client";

import { KfInlineContactActions } from "@/components/kasifind/kf-inline-contact-actions";
import { useListingPageContactCtaLabel } from "@/components/kasifind/use-listing-page-contact-cta-label";

type Props = {
  listingId: string;
  displayName: string;
  waUrl: string | null;
  callPhone: string;
  directionsUrl: string | null;
};

/** Fixed listing contact strip — playful CTA line + same four icon actions as search cards. */
export function KfListingPersistentContactBar({
  listingId,
  displayName,
  waUrl,
  callPhone,
  directionsUrl,
}: Props) {
  const ctaLabel = useListingPageContactCtaLabel(listingId);

  return (
    <nav className="kf-listing-persistent-contact" aria-label="Contact this business">
      <div className="kf-listing-persistent-contact-inner">
        {ctaLabel ? <p className="kf-listing-persistent-contact-label">{ctaLabel}</p> : null}
        <KfInlineContactActions
          listingId={listingId}
          displayName={displayName}
          waUrl={waUrl}
          callPhone={callPhone}
          directionsUrl={directionsUrl}
          variant="card"
          className="kf-listing-persistent-contact-actions"
        />
      </div>
    </nav>
  );
}
"use client";

import { KfInlineContactActions } from "@/components/kasifind/kf-inline-contact-actions";

type Props = {
  listingId: string;
  displayName: string;
  waUrl: string | null;
  callPhone: string;
  directionsUrl: string | null;
};

export function KfListingProfileContactBar({
  listingId,
  displayName,
  waUrl,
  callPhone,
  directionsUrl,
}: Props) {
  return (
    <div className="kf-profile-contact-bar" role="navigation" aria-label="Contact and share">
      <KfInlineContactActions
        listingId={listingId}
        displayName={displayName}
        waUrl={waUrl}
        callPhone={callPhone}
        directionsUrl={directionsUrl}
        variant="card"
        className="kf-profile-contact-bar-actions"
      />
    </div>
  );
}

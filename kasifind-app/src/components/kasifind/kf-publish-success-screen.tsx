"use client";

import Link from "next/link";
import { CheckCircle2, Home, Store } from "lucide-react";

export function KfPublishSuccessScreen({ listingId }: { listingId: string | null }) {
  return (
    <div className="kf-publish-success kf-animate-in" role="status">
      <div className="kf-publish-success-icon" aria-hidden>
        <CheckCircle2 className="h-12 w-12 text-[var(--kf-forest)]" strokeWidth={2} />
      </div>
      <h2 className="kf-publish-success-title">Submitted for review</h2>
      <p className="kf-publish-success-lead">
        Your listing is in the queue. We usually approve within{" "}
        <strong>1–2 business days</strong>, then neighbours can find you in search.
      </p>
      <ul className="kf-publish-success-list">
        <li>
          Your map location was saved from the pin you set (exact listings also use GPS at publish).
        </li>
        <li>You can still edit your listing while it is in review.</li>
        <li>WhatsApp and call buttons go live on your profile once approved.</li>
      </ul>
      <div className="kf-publish-success-actions">
        {listingId ? (
          <Link href={`/providers/${listingId}`} className="kf-btn kf-btn-outline w-full sm:w-auto">
            <Store className="h-4 w-4" aria-hidden />
            Preview listing
          </Link>
        ) : null}
        <Link href="/account/listing" className="kf-btn kf-btn-primary w-full sm:w-auto">
          Back to your listing
        </Link>
        <Link href="/" className="kf-btn kf-btn-ghost w-full sm:w-auto">
          <Home className="h-4 w-4" aria-hidden />
          Go to homepage
        </Link>
      </div>
    </div>
  );
}

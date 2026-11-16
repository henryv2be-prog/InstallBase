"use client";

import { MapPin, ShieldCheck, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChooseArea?: () => void;
  busy?: boolean;
};

export function KfLocationConsentDialog({
  open,
  onClose,
  onConfirm,
  onChooseArea,
  busy,
}: Props) {
  if (!open) return null;

  return (
    <div className="kf-dialog-root kf-location-consent-root" role="presentation">
      <button type="button" className="kf-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div
        className="kf-dialog-panel kf-dialog-panel--solid kf-location-consent-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kf-location-dialog-title"
        aria-describedby="kf-location-dialog-desc"
      >
        <button type="button" className="kf-dialog-close" aria-label="Close" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        <div className="kf-dialog-icon kf-location-consent-icon" aria-hidden>
          <MapPin className="h-6 w-6" />
        </div>
        <h2 id="kf-location-dialog-title" className="kf-dialog-title">
          Show nearby businesses?
        </h2>
        <p id="kf-location-dialog-desc" className="kf-dialog-body">
          You can browse nationwide without sharing location. Allow access to sort results by distance
          from you — your exact pin is never shown on listings.
        </p>
        <div className="kf-location-consent-trust" role="note">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
          <span>Used only for search and sorting on your device.</span>
        </div>
        <div className="kf-dialog-actions">
          <button type="button" className="kf-btn kf-btn-primary w-full" disabled={busy} onClick={onConfirm}>
            {busy ? "Getting location…" : "Use my location"}
          </button>
          {onChooseArea ? (
            <button
              type="button"
              className="kf-btn kf-btn-outline w-full"
              disabled={busy}
              onClick={() => {
                onChooseArea();
                onClose();
              }}
            >
              Search for an area instead
            </button>
          ) : null}
          <button type="button" className="kf-btn kf-btn-ghost w-full" disabled={busy} onClick={onClose}>
            Not now — browse all listings
          </button>
        </div>
      </div>
    </div>
  );
}
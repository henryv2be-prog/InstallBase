"use client";

import { MapPin, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChooseArea?: () => void;
  busy?: boolean;
  /** Softer entry (homepage after intro); default keeps standard dialog motion. */
  subtle?: boolean;
};

export function KfLocationConsentDialog({
  open,
  onClose,
  onConfirm,
  onChooseArea,
  busy,
  subtle = false,
}: Props) {
  if (!open) return null;

  return (
    <div
      className={`kf-dialog-root${subtle ? " kf-location-consent--subtle" : ""}`}
      role="presentation"
    >
      <button type="button" className="kf-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div
        className={`kf-dialog-panel${subtle ? " kf-location-consent-panel" : " kf-animate-in"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kf-location-dialog-title"
        aria-describedby="kf-location-dialog-desc"
      >
        <button type="button" className="kf-dialog-close" aria-label="Close" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        <div className={`kf-dialog-icon${subtle ? " kf-location-consent-icon" : ""}`} aria-hidden>
          <MapPin className={subtle ? "h-5 w-5" : "h-7 w-7"} />
        </div>
        <h2 id="kf-location-dialog-title" className="kf-dialog-title">
          {subtle ? "Show nearby businesses?" : "Accurate distances need your area"}
        </h2>
        <p id="kf-location-dialog-desc" className="kf-dialog-body">
          {subtle ? (
            <>
              You can browse nationwide without sharing location. Allow access to sort by distance
              from you — your exact pin is not shown on listings.
            </>
          ) : (
            <>
              Without location you can still browse <strong>all listings nationwide</strong>, but you
              miss nearby sorting and distance in km. Allow location to see providers sorted by real
              distance from you. Your exact GPS is <strong>not shown</strong> on provider profiles —
              it is only used for search and sorting on your device.
            </>
          )}
        </p>
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

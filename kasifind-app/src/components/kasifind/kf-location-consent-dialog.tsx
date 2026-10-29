"use client";

import { MapPin, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
};

export function KfLocationConsentDialog({ open, onClose, onConfirm, busy }: Props) {
  if (!open) return null;

  return (
    <div className="kf-dialog-root" role="presentation">
      <button type="button" className="kf-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div
        className="kf-dialog-panel kf-animate-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kf-location-dialog-title"
        aria-describedby="kf-location-dialog-desc"
      >
        <button type="button" className="kf-dialog-close" aria-label="Close" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        <div className="kf-dialog-icon" aria-hidden>
          <MapPin className="h-7 w-7" />
        </div>
        <h2 id="kf-location-dialog-title" className="kf-dialog-title">
          Accurate distances need your area
        </h2>
        <p id="kf-location-dialog-desc" className="kf-dialog-body">
          Right now, listings are sorted using a <strong>default map centre</strong>, so kilometres
          shown may not match where you actually are. Allow location to see providers sorted by real
          distance from you. Your exact GPS is <strong>not shown</strong> on provider profiles — it
          is only used for search and sorting on your device.
        </p>
        <div className="kf-dialog-actions">
          <button type="button" className="kf-btn kf-btn-primary w-full" disabled={busy} onClick={onConfirm}>
            {busy ? "Getting location…" : "Use my location"}
          </button>
          <button type="button" className="kf-btn kf-btn-outline w-full" disabled={busy} onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

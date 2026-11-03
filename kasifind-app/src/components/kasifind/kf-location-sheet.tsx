"use client";

import { Globe2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { KfAreaSearchPicker } from "@/components/kasifind/kf-area-search-picker";
import type { GeocodeHit } from "@/lib/kasifind/geocode-utils";
import type { KfDiscoveryLocation } from "@/lib/kasifind/discovery-state";
import { locationModeHint, locationModeLabel } from "@/lib/kasifind/discovery-display";

type Props = {
  open: boolean;
  onClose: () => void;
  location: KfDiscoveryLocation;
  locating: boolean;
  geolocationAvailable: boolean;
  permissionDenied: boolean;
  view: "menu" | "area";
  onViewChange: (view: "menu" | "area") => void;
  onUseGps: () => void;
  onBrowseAll: () => void;
  onAreaSelected: (place: GeocodeHit) => void;
  areaSearchInitialQuery: string;
};

export function KfLocationSheet({
  open,
  onClose,
  location,
  locating,
  geolocationAvailable,
  permissionDenied,
  view,
  onViewChange,
  onUseGps,
  onBrowseAll,
  onAreaSelected,
  areaSearchInitialQuery,
}: Props) {
  if (!open) return null;

  return (
    <div className="kf-location-sheet-root" role="presentation">
      <button type="button" className="kf-dialog-backdrop" aria-label="Close" onClick={onClose} />
      <div
        className="kf-location-sheet-panel kf-animate-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kf-location-sheet-title"
      >
        <div className="kf-location-sheet-head">
          <div className="min-w-0">
            <p className="kf-location-sheet-kicker">Search location</p>
            <h2 id="kf-location-sheet-title" className="kf-location-sheet-title">
              {view === "area" ? "Search another area" : "Where should we search?"}
            </h2>
            <p className="kf-location-sheet-current">
              <MapPin className="inline h-3.5 w-3.5" aria-hidden /> Now:{" "}
              <strong>{locationModeLabel(location)}</strong>
            </p>
            <p className="kf-help mt-1">{locationModeHint(location)}</p>
          </div>
          <button type="button" className="kf-dialog-close" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {view === "menu" ? (
          <div className="kf-location-sheet-actions">
            {geolocationAvailable ? (
              <button
                type="button"
                className="kf-location-sheet-option"
                disabled={locating}
                onClick={onUseGps}
              >
                <LocateFixed className="h-5 w-5 shrink-0 text-[var(--kf-forest)]" aria-hidden />
                <span className="min-w-0 text-left">
                  <span className="kf-location-sheet-option-title">Use my current location</span>
                  <span className="kf-location-sheet-option-sub">
                    Best for finding businesses near you right now.
                  </span>
                </span>
              </button>
            ) : null}

            <button
              type="button"
              className="kf-location-sheet-option"
              onClick={() => onViewChange("area")}
            >
              <Search className="h-5 w-5 shrink-0 text-[var(--kf-forest)]" aria-hidden />
              <span className="min-w-0 text-left">
                <span className="kf-location-sheet-option-title">Search another area</span>
                <span className="kf-location-sheet-option-sub">
                  Pick a suburb or town — no coordinates needed.
                </span>
              </span>
            </button>

            <button type="button" className="kf-location-sheet-option" onClick={onBrowseAll}>
              <Globe2 className="h-5 w-5 shrink-0 text-[var(--kf-forest)]" aria-hidden />
              <span className="min-w-0 text-left">
                <span className="kf-location-sheet-option-title">Browse all areas</span>
                <span className="kf-location-sheet-option-sub">
                  See every listing nationwide (not sorted by distance).
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <button
              type="button"
              className="kf-link mb-2 text-sm"
              onClick={() => onViewChange("menu")}
            >
              ← Back to location options
            </button>
            <KfAreaSearchPicker
              initialQuery={areaSearchInitialQuery}
              onSelect={(place) => {
                onAreaSelected(place);
                onViewChange("menu");
              }}
            />
          </div>
        )}

        {permissionDenied ? (
          <p className="kf-location-sheet-foot">
            Location is blocked in your browser settings. You can still search an area or browse all
            listings. To use GPS, allow location for this site in your phone&apos;s settings, then
            tap <strong>Use my current location</strong>.
          </p>
        ) : (
          <p className="kf-location-sheet-foot">
            Your exact GPS is never shown on provider profiles — it is only used to sort nearby
            results on your device.
          </p>
        )}
      </div>
    </div>
  );
}

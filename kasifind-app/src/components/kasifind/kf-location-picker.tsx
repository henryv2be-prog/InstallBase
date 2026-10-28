"use client";

import { useCallback, useState } from "react";
import { Loader2, Navigation } from "lucide-react";
import { KfLocationMap } from "@/components/kasifind/kf-location-map";
import { APPROXIMATE_MAP_RADIUS_M } from "@/lib/kasifind/location-display";
import { requestCurrentPositionForPublish } from "@/lib/kasifind/request-current-position";

type Props = {
  initialLatitude: number;
  initialLongitude: number;
  initialHideExactLocation: boolean;
};

export function KfLocationPicker({
  initialLatitude,
  initialLongitude,
  initialHideExactLocation,
}: Props) {
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [hideExactLocation, setHideExactLocation] = useState(initialHideExactLocation);
  const [locating, setLocating] = useState(false);

  const approximate = hideExactLocation;

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    const position = await requestCurrentPositionForPublish();
    setLocating(false);
    if (position.ok === true) {
      setLatitude(position.latitude);
      setLongitude(position.longitude);
    }
  }, []);

  return (
    <div className="space-y-3">
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />
      <input type="hidden" name="hideExactLocation" value={hideExactLocation ? "true" : "false"} />

      <KfLocationMap
        latitude={latitude}
        longitude={longitude}
        approximate={approximate}
        radiusMeters={approximate ? APPROXIMATE_MAP_RADIUS_M : null}
        interactive
        onLocationChange={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="kf-btn kf-btn-ghost text-sm"
          disabled={locating}
          onClick={() => void useMyLocation()}
        >
          {locating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Locating…
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" aria-hidden />
              Use my location
            </>
          )}
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="kf-label">What customers see on the map</legend>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
            hideExactLocation
              ? "border-[var(--kf-orange)] bg-[var(--kf-orange-soft)]"
              : "border-[var(--kf-border)]"
          }`}
        >
          <input
            type="radio"
            name="locationVisibilityChoice"
            className="mt-1"
            checked={hideExactLocation}
            onChange={() => setHideExactLocation(true)}
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--kf-charcoal)]">
              Approximate area
            </span>
            <span className="mt-0.5 block text-xs text-[var(--kf-muted)]">
              Shows a ~1 km circle — recommended for home-based businesses.
            </span>
          </span>
        </label>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
            !hideExactLocation
              ? "border-[var(--kf-orange)] bg-[var(--kf-orange-soft)]"
              : "border-[var(--kf-border)]"
          }`}
        >
          <input
            type="radio"
            name="locationVisibilityChoice"
            className="mt-1"
            checked={!hideExactLocation}
            onChange={() => setHideExactLocation(false)}
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--kf-charcoal)]">
              Exact pin
            </span>
            <span className="mt-0.5 block text-xs text-[var(--kf-muted)]">
              Shows your precise location on the map (shopfront, yard, etc.).
            </span>
          </span>
        </label>
      </fieldset>
    </div>
  );
}

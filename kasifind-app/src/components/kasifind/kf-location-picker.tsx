"use client";

import { useCallback, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { KfLocationMap } from "@/components/kasifind/kf-location-map";
import { APPROXIMATE_MAP_RADIUS_M } from "@/lib/kasifind/location-display";
import {
  publishLocationErrorMessage,
  requestCurrentPositionForPublish,
} from "@/lib/kasifind/request-current-position";
import { SA_MAP_DEFAULT_VIEW } from "@/lib/kasifind/geo";
import { useKfToast } from "@/components/kasifind/kf-toast";

type Props = {
  initialLatitude: number | null;
  initialLongitude: number | null;
  initialHideExactLocation: boolean;
};

export function KfLocationPicker({
  initialLatitude,
  initialLongitude,
  initialHideExactLocation,
}: Props) {
  const toast = useKfToast();
  const hasSavedPin =
    initialLatitude !== null &&
    initialLongitude !== null &&
    Number.isFinite(initialLatitude) &&
    Number.isFinite(initialLongitude);

  const [pinPlaced, setPinPlaced] = useState(hasSavedPin);
  const [latitude, setLatitude] = useState(initialLatitude ?? SA_MAP_DEFAULT_VIEW.latitude);
  const [longitude, setLongitude] = useState(initialLongitude ?? SA_MAP_DEFAULT_VIEW.longitude);
  const [hideExactLocation, setHideExactLocation] = useState(initialHideExactLocation);
  const [locating, setLocating] = useState(false);

  const approximate = hideExactLocation;

  const applyPosition = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setPinPlaced(true);
  }, []);

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    const position = await requestCurrentPositionForPublish();
    setLocating(false);
    if (position.ok === true) {
      applyPosition(position.latitude, position.longitude);
      return;
    }
    toast.error(publishLocationErrorMessage(position.reason));
  }, [applyPosition, toast]);

  return (
    <div className="space-y-3">
      <input type="hidden" name="latitude" value={pinPlaced ? String(latitude) : ""} readOnly />
      <input type="hidden" name="longitude" value={pinPlaced ? String(longitude) : ""} readOnly />
      <input type="hidden" name="locationConfirmed" value={pinPlaced ? "true" : "false"} readOnly />
      <input type="hidden" name="hideExactLocation" value={hideExactLocation ? "true" : "false"} />

      {!pinPlaced ? (
        <p className="kf-location-required-hint" role="status">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--kf-orange)]" aria-hidden />
          Tap the map to set an approximate area, or use <strong>My location</strong> for a precise
          pin.
        </p>
      ) : null}

      <KfLocationMap
        latitude={latitude}
        longitude={longitude}
        pinPlaced={pinPlaced}
        approximate={approximate}
        radiusMeters={approximate && pinPlaced ? APPROXIMATE_MAP_RADIUS_M : null}
        interactive
        onLocationChange={applyPosition}
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
              Tap the map to place a ~1 km circle — works without GPS permission.
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
              Uses your device location when you publish (shopfront, yard, etc.).
            </span>
          </span>
        </label>
      </fieldset>
    </div>
  );
}

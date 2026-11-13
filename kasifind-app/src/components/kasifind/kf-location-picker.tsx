"use client";

import { useCallback, useState } from "react";
import { Loader2, Navigation } from "lucide-react";
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

  const chooseApproximate = () => {
    setHideExactLocation(true);
  };

  const chooseExact = () => {
    setHideExactLocation(false);
    if (!pinPlaced && !locating) {
      void useMyLocation();
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="latitude" value={pinPlaced ? String(latitude) : ""} readOnly />
      <input type="hidden" name="longitude" value={pinPlaced ? String(longitude) : ""} readOnly />
      <input type="hidden" name="locationConfirmed" value={pinPlaced ? "true" : "false"} readOnly />
      <input type="hidden" name="hideExactLocation" value={hideExactLocation ? "true" : "false"} />

      <KfLocationMap
        latitude={latitude}
        longitude={longitude}
        pinPlaced={pinPlaced}
        approximate={approximate}
        radiusMeters={approximate && pinPlaced ? APPROXIMATE_MAP_RADIUS_M : null}
        interactive
        onLocationChange={applyPosition}
      />

      <button
        type="button"
        className="kf-btn kf-btn-outline w-full min-h-[2.75rem] text-sm"
        disabled={locating}
        onClick={() => void useMyLocation()}
      >
        {locating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Getting GPS…
          </>
        ) : (
          <>
            <Navigation className="h-4 w-4" aria-hidden />
            Use my location
          </>
        )}
      </button>

      {!pinPlaced ? (
        <p className="kf-help m-0 text-center" role="status">
          {hideExactLocation ? "Tap the map or use My location." : "Allow GPS or tap the map."}
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="kf-label">On your public map</legend>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 ${
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
            onChange={chooseApproximate}
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--kf-charcoal)]">
              Approximate area
            </span>
            <span className="mt-0.5 block text-xs text-[var(--kf-muted)]">~1 km circle.</span>
          </span>
        </label>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 ${
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
            onChange={chooseExact}
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--kf-charcoal)]">Exact pin</span>
            <span className="mt-0.5 block text-xs text-[var(--kf-muted)]">Uses GPS when selected.</span>
          </span>
        </label>
      </fieldset>
    </div>
  );
}

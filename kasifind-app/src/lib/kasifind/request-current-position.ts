"use client";

export type CurrentPositionResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: "unsupported" | "denied" | "unavailable" | "timeout" | "outside_sa" };

const PUBLISH_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 0,
};

export function requestCurrentPositionForPublish(): Promise<CurrentPositionResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (latitude < -35.5 || latitude > -22 || longitude < 16 || longitude > 33.5) {
          resolve({ ok: false, reason: "outside_sa" });
          return;
        }
        resolve({ ok: true, latitude, longitude });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) resolve({ ok: false, reason: "denied" });
        else if (err.code === err.TIMEOUT) resolve({ ok: false, reason: "timeout" });
        else resolve({ ok: false, reason: "unavailable" });
      },
      PUBLISH_GEO_OPTIONS
    );
  });
}

export function publishLocationErrorMessage(
  reason: Extract<CurrentPositionResult, { ok: false }>["reason"]
): string {
  switch (reason) {
    case "unsupported":
      return "This browser can't detect location. Save a draft and enter coordinates manually, or try another device.";
    case "denied":
      return "Exact pin needs location permission — allow access, or switch to Approximate area and tap the map instead.";
    case "timeout":
      return "Location took too long. Check GPS signal and try Publish again.";
    case "unavailable":
      return "Couldn't detect your location. Try again or save as draft and set coordinates manually.";
    case "outside_sa":
      return "Your location looks outside South Africa. Move into coverage or save as draft and set coordinates manually.";
    default:
      return "Couldn't detect your location.";
  }
}

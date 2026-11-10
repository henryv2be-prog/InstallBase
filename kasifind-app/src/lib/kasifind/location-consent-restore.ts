import type { KfDiscoveryLocation } from "@/lib/kasifind/discovery-state";
import type { KfLocationConsentState } from "@/lib/kasifind/location-consent-storage";

/**
 * GPS is only started from an explicit user action (e.g. “Use my current location”).
 * Never auto-call getCurrentPosition on homepage load.
 */
export function shouldSkipAutoGpsOnHomeLoad(
  _consent: KfLocationConsentState | null,
  _restoredLocation: KfDiscoveryLocation | null | undefined
): boolean {
  return true;
}

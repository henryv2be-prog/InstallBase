import type { KfDiscoveryLocation } from "@/lib/kasifind/discovery-state";
import type { KfLocationConsentState } from "@/lib/kasifind/location-consent-storage";

/**
 * Whether to skip automatic GPS on homepage load when restoring session state.
 * Default "browse" in sessionStorage is not treated as an explicit nationwide choice —
 * only manual area picks, or browse paired with dismissed/denied consent.
 */
export function shouldSkipAutoGpsOnHomeLoad(
  consent: KfLocationConsentState | null,
  restoredLocation: KfDiscoveryLocation | null | undefined
): boolean {
  if (restoredLocation?.mode === "manual") return true;
  if (restoredLocation?.mode === "browse") {
    return consent === "dismissed" || consent === "denied";
  }
  return false;
}

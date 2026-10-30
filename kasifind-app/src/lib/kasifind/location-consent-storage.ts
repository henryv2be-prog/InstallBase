/** Persist homepage location consent (localStorage — survives new tabs/sessions). */

export const KF_LOCATION_CONSENT_KEY = "kf_location_consent";

export type KfLocationConsentState = "granted" | "dismissed" | "denied";

export function readLocationConsent(): KfLocationConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KF_LOCATION_CONSENT_KEY);
    if (raw === "granted" || raw === "dismissed" || raw === "denied") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeLocationConsent(state: KfLocationConsentState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KF_LOCATION_CONSENT_KEY, state);
  } catch {
    /* ignore */
  }
}

export function clearLocationConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KF_LOCATION_CONSENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Homepage landing veil — defer location consent until fade-in finishes. */
export type KfHomeIntroGate = "pending" | "fading" | "off";

export function shouldDeferHomeLocationConsentPrompt(introGate: KfHomeIntroGate): boolean {
  return introGate === "pending" || introGate === "fading";
}

/** Brief pause after intro veil clears so the prompt appears over the homepage. */
export const KF_LOCATION_CONSENT_AFTER_INTRO_MS = 320;
/** Homepage intro gate — defer location consent until cinematic intro finishes. */
export type KfHomeIntroGate = "pending" | "play" | "off";

export function shouldDeferHomeLocationConsentPrompt(introGate: KfHomeIntroGate): boolean {
  return introGate === "pending" || introGate === "play";
}

/** Brief pause after intro veil clears so the prompt fades in over the homepage. */
export const KF_LOCATION_CONSENT_AFTER_INTRO_MS = 320;

export const NOTIFY_PROMPT_DISMISS_KEY = "ib-notify-prompt";

export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isPushApiAvailable() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** iOS Safari can only receive Web Push after Add to Home Screen. */
export function needsIosInstallForPush() {
  return isIosDevice() && !isStandaloneDisplay();
}

const HUAWEI_MODEL_PREFIX =
  /Android [\d.]+; (?:MGA|ANA|JNY|MAR|ELS|VOG|LYA|CLT|EML|HMA|STK|YAL|JEF|CDY|TAS|BRQ|NOP|OCE|NAM|LIO|SEA|TNY|JSN|PAR|POT|COR|JKM|DUB|INE|EVR|HRY|PRA|ATU|BLL|LDN|FIG|KOB|DUA|AGS|BTK|BAL|GOA|RTE|CTR|FRL|MED|NIC|WLZ|JAD)-/i;

export function isHuaweiDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Huawei|HONOR|HMSCore|HUAWEI|HarmonyOS/i.test(ua) || HUAWEI_MODEL_PREFIX.test(ua);
}

/** Huawei/Honor phones without GMS cannot use Chrome's FCM-backed Web Push. */
export function likelyLacksGooglePlayServices() {
  if (!isHuaweiDevice()) return false;
  const ua = navigator.userAgent;
  return !/; GMS\b|; google\b/i.test(ua);
}

/** EMUI/Huawei launchers often fail the native install prompt — manual A2HS is more reliable. */
export function prefersManualHomeScreenInstall() {
  return isIosDevice() || isHuaweiDevice();
}

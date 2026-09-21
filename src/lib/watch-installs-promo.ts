export const WATCH_INSTALLS_PROMO_KEY = "ib-watch-installs-promo-v1";
export const WELCOME_DISMISS_KEY = "ib-welcome-dismissed";

export function markWatchInstallsPromoSeen() {
  try {
    localStorage.setItem(WATCH_INSTALLS_PROMO_KEY, "1");
  } catch {
    // ignore private mode
  }
}

export function hasSeenWatchInstallsPromo() {
  try {
    return localStorage.getItem(WATCH_INSTALLS_PROMO_KEY) === "1";
  } catch {
    return true;
  }
}

import { needsIosInstallForPush } from "@/components/pwa/device";

/** Turn browser / server errors into actionable copy for installers. */
export function describePushEnableError(error: unknown): string {
  if (needsIosInstallForPush()) {
    return "On iPhone, add InstallBase to your Home Screen first, then open it from that icon to enable alerts.";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized") || message.includes("sign in")) {
      return "Your session expired. Refresh the page, sign in again, then try enabling alerts.";
    }

    if (message.includes("service worker") && message.includes("timeout")) {
      return "The app is still loading. Wait a few seconds and try again.";
    }

    if (
      message.includes("applicationserverkey") ||
      message.includes("vapid") ||
      message.includes("invalid key")
    ) {
      return "Push is misconfigured on the server. Ask an admin to check the VAPID keys.";
    }

    if (message.includes("push service") || message.includes("registration failed")) {
      return "This browser could not register for push. Try Chrome or Edge, or reinstall the app from your home screen.";
    }

    if (message.includes("secure origin") || message.includes("https")) {
      return "Alerts only work on a secure connection (HTTPS).";
    }

    if (error.name === "NotAllowedError" || message.includes("not allowed")) {
      return "Notifications are blocked in your browser settings. Allow them for this site, then try again.";
    }

    if (error.name === "AbortError") {
      return "Push registration was interrupted. Check your connection and try again.";
    }

    if (error.name === "InvalidStateError") {
      return "Push is in an unexpected state. Refresh the page and try again.";
    }

    if (message.trim()) {
      return error.message;
    }
  }

  return "Could not enable notifications. Try refreshing the page or use Settings → Notifications.";
}

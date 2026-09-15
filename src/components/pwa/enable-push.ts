import { savePushSubscription } from "@/lib/actions";
import { describePushEnableError } from "@/components/pwa/push-errors";
import { subscriptionPayload, urlBase64ToUint8Array } from "@/components/pwa/push-utils";

const SW_READY_TIMEOUT_MS = 15_000;

function isValidVapidPublicKey(key: string) {
  const trimmed = key.trim();
  return /^[A-Za-z0-9_-]{80,88}$/.test(trimmed);
}

async function waitForServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });

  if (registration.active) return registration;

  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<ServiceWorkerRegistration>((_, reject) => {
      window.setTimeout(
        () => reject(new Error("Service worker timeout — try refreshing the page")),
        SW_READY_TIMEOUT_MS
      );
    }),
  ]);
}

export async function enablePushNotifications(vapidPublicKey: string) {
  const trimmedKey = vapidPublicKey.trim();
  if (!trimmedKey) {
    return {
      ok: false as const,
      permission: typeof Notification !== "undefined" ? Notification.permission : "denied",
      error: "Push is not configured on the server yet.",
    };
  }

  if (!isValidVapidPublicKey(trimmedKey)) {
    return {
      ok: false as const,
      permission: typeof Notification !== "undefined" ? Notification.permission : "denied",
      error: "Push is misconfigured on the server (invalid VAPID public key).",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false as const, permission, error: "Notifications were blocked" };
    }

    const registration = await waitForServiceWorkerRegistration();

    try {
      const existing = await registration.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();
    } catch {
      // Stale subscription — continue and create a fresh one.
    }

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(trimmedKey),
    });

    const payload = subscriptionPayload(sub);
    if (!payload) {
      return { ok: false as const, permission, error: "Incomplete subscription from this browser" };
    }

    const result = await savePushSubscription(payload);
    if (result && "error" in result && result.error) {
      return { ok: false as const, permission, error: result.error };
    }

    return { ok: true as const, permission };
  } catch (error) {
    console.error("Enable push failed:", error);
    return {
      ok: false as const,
      permission: typeof Notification !== "undefined" ? Notification.permission : "denied",
      error: describePushEnableError(error),
    };
  }
}

import { savePushSubscription } from "@/lib/actions";
import { subscriptionPayload, urlBase64ToUint8Array } from "@/components/pwa/push-utils";

export async function enablePushNotifications(vapidPublicKey: string) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false as const, permission, error: "Notifications were blocked" };
  }

  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) await existing.unsubscribe();
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  const payload = subscriptionPayload(sub);
  if (!payload) return { ok: false as const, permission, error: "Incomplete subscription" };

  const result = await savePushSubscription(payload);
  if (result && "error" in result && result.error) {
    return { ok: false as const, permission, error: result.error };
  }
  return { ok: true as const, permission };
}

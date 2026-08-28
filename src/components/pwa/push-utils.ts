"use client";

import { savePushSubscription } from "@/lib/actions";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function subscriptionPayload(sub: PushSubscription) {
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  };
}

/** Save the browser's existing push subscription for the logged-in user. Returns true if the server has it. */
export async function syncLocalPushSubscription(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  const sub = registration ? await registration.pushManager.getSubscription() : null;
  if (!sub) return false;
  const payload = subscriptionPayload(sub);
  if (!payload) return false;
  const result = await savePushSubscription(payload);
  return !(result && "error" in result && result.error);
}

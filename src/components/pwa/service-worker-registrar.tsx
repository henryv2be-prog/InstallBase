"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { savePushSubscription } from "@/lib/actions";

function subscriptionPayload(sub: PushSubscription) {
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  };
}

export function ServiceWorkerRegistrar() {
  const { status } = useSession();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    let cancelled = false;
    (async () => {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (!sub || cancelled) return;
      const payload = subscriptionPayload(sub);
      if (!payload) return;
      await savePushSubscription(payload);
    })().catch((error) => {
      console.error("Push subscription sync failed:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}

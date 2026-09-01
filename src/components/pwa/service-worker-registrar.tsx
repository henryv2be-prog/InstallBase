"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncLocalPushSubscription } from "@/components/pwa/push-utils";

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
      await navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
      if (cancelled) return;
      await syncLocalPushSubscription();
    })().catch((error) => {
      console.error("Push subscription sync failed:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}

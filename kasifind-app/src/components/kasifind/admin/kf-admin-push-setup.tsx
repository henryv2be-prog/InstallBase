"use client";

import { useCallback, useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

type Props = {
  vapidConfigured: boolean;
};

export function KfAdminPushSetup({ vapidConfigured }: Props) {
  const [status, setStatus] = useState<string>("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
    void navigator.serviceWorker.getRegistration("/admin-push-sw.js").then((reg) => {
      void reg?.pushManager.getSubscription().then((sub) => setSubscribed(Boolean(sub)));
    });
  }, []);

  const enablePush = useCallback(async () => {
    if (!vapidConfigured) {
      setStatus("Server VAPID keys are not configured yet.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setStatus("Notifications were not granted. You can enable them later in Chrome settings.");
        return;
      }

      const keyRes = await fetch("/api/admin/push/vapid-public-key");
      if (!keyRes.ok) throw new Error("Could not load push configuration.");
      const { publicKey } = (await keyRes.json()) as { publicKey?: string };
      if (!publicKey) throw new Error("VAPID public key missing.");

      const registration = await navigator.serviceWorker.register("/admin-push-sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const body = JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth,
        },
        deviceLabel: navigator.userAgent?.slice(0, 80),
      });

      const subRes = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!subRes.ok) throw new Error("Subscription save failed.");
      setSubscribed(true);
      setStatus("This device is subscribed for admin push.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not enable push on this device.");
    } finally {
      setBusy(false);
    }
  }, [vapidConfigured]);

  return (
    <div className="kf-card space-y-3 p-4">
      <h2 className="text-base font-semibold text-[var(--kf-ink)]">Android push on this device</h2>
      <p className="text-sm text-[var(--kf-muted)]">
        On Android Chrome, open <strong>/admin</strong>, use <em>Add to Home screen</em>, sign in as
        admin, then enable notifications here. Permission is requested only when you tap Enable.
      </p>
      {permission === "unsupported" ? (
        <p className="text-sm text-amber-800">This browser does not support Web Push.</p>
      ) : (
        <p className="text-sm text-[var(--kf-muted)]">
          Permission: <span className="font-medium text-[var(--kf-ink)]">{permission}</span>
          {subscribed ? " · Subscribed" : ""}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="kf-btn kf-btn-primary text-sm" disabled={busy} onClick={() => void enablePush()}>
          {busy ? "Working…" : subscribed ? "Renew subscription" : "Enable notifications"}
        </button>
      </div>
      {status ? <p className="text-sm text-[var(--kf-ink)]">{status}</p> : null}
    </div>
  );
}
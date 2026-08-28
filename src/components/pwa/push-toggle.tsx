"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { savePushSubscription, deletePushSubscription, sendTestPush } from "@/lib/actions";
import { toast } from "sonner";
import { subscriptionPayload, syncLocalPushSubscription, urlBase64ToUint8Array } from "@/components/pwa/push-utils";

function isIosDevice() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function PushNotificationToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [checked, setChecked] = useState(false);
  const [supported, setSupported] = useState(false);
  const [needsIosInstall, setNeedsIosInstall] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      setSupported(ok);
      setNeedsIosInstall(isIosDevice() && !isStandaloneDisplay());
      if (!ok) {
        if (!cancelled) setChecked(true);
        return;
      }
      setPermission(Notification.permission);
      const saved = await syncLocalPushSubscription();
      if (!cancelled) {
        setSubscribed(saved);
        setChecked(true);
      }
    })().catch(() => {
      if (!cancelled) setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked) {
    return <p className="text-sm text-muted">Checking whether this device can receive alerts…</p>;
  }

  if (needsIosInstall) {
    return (
      <p className="text-sm text-muted">
        On iPhone, add InstallBase to the Home Screen first (Share → Add to Home Screen), then open it from the icon to enable alerts. iOS 16.4+.
      </p>
    );
  }

  if (!supported) {
    return (
      <p className="text-sm text-muted">
        Push notifications are not supported in this browser. On iPhone, install InstallBase to the Home Screen first (iOS 16.4+).
      </p>
    );
  }

  if (!vapidPublicKey) {
    return (
      <p className="text-sm text-muted">
        Notifications are not configured on this server yet. Add VAPID keys (see README) and redeploy.
      </p>
    );
  }

  const enable = async () => {
    setBusy(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        toast.error("Notifications were blocked");
        return;
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
      if (!payload) throw new Error("Incomplete subscription");
      const result = await savePushSubscription(payload);
      if (result && "error" in result && result.error) throw new Error(result.error);
      setSubscribed(true);
      toast.success("Alerts enabled on this device");
    } catch (error) {
      console.error("Enable push failed:", error);
      toast.error("Could not enable notifications");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Alerts turned off on this device");
    } catch {
      toast.error("Could not disable notifications");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    try {
      const synced = await syncLocalPushSubscription();
      if (!synced) {
        setSubscribed(false);
        toast.error("No device is registered yet. Enable alerts first.");
        return;
      }
      const result = await sendTestPush();
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Test alert sent — check your lock screen");
    } catch {
      toast.error("Could not send a test alert");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Get a phone notification when someone messages you, follows you, or interacts with your posts.
        {permission === "denied" && " Notifications are blocked in browser settings — allow them for this site, then try again."}
      </p>
      <div className="flex flex-wrap gap-2">
        {subscribed ? (
          <>
            <Button variant="outline" onClick={disable} disabled={busy}>
              <BellOff className="h-4 w-4" />
              {busy ? "Updating..." : "Disable alerts"}
            </Button>
            <Button variant="outline" onClick={test} disabled={busy}>
              <Send className="h-4 w-4" />
              Send test alert
            </Button>
          </>
        ) : (
          <Button onClick={enable} disabled={busy || permission === "denied"}>
            <Bell className="h-4 w-4" />
            {busy ? "Enabling..." : "Enable alerts"}
          </Button>
        )}
      </div>
    </div>
  );
}

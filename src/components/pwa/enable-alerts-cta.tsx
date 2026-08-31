"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isPushApiAvailable, needsIosInstallForPush } from "@/components/pwa/device";
import { enablePushNotifications } from "@/components/pwa/enable-push";
import { syncLocalPushSubscription } from "@/components/pwa/push-utils";

export function EnableAlertsCta({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [iosInstall, setIosInstall] = useState(false);

  useEffect(() => {
    if (!vapidPublicKey || !isPushApiAvailable()) return;
    if (needsIosInstallForPush()) {
      setIosInstall(true);
      setShow(true);
      return;
    }
    if (Notification.permission === "denied") return;
    let cancelled = false;
    syncLocalPushSubscription()
      .then((already) => {
        if (!cancelled && !already) setShow(true);
      })
      .catch(() => {
        if (!cancelled) setShow(true);
      });
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  if (!show) return null;

  if (iosInstall) {
    return (
      <p className="mt-3 text-sm text-muted">
        On iPhone, add InstallBase to the Home Screen first, then open it from that icon to enable lock-screen alerts.
      </p>
    );
  }

  const enable = async () => {
    setBusy(true);
    try {
      const result = await enablePushNotifications(vapidPublicKey);
      if (!result.ok) {
        toast.error(result.error);
        if (result.permission === "denied") setShow(false);
        return;
      }
      setShow(false);
      toast.success("Alerts enabled on this device");
    } catch {
      toast.error("Could not enable notifications");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={enable} disabled={busy}>
        <Bell className="h-4 w-4" />
        {busy ? "Enabling..." : "Enable phone alerts"}
      </Button>
    </div>
  );
}

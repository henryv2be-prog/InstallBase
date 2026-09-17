"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePushSubscription, sendTestPush } from "@/lib/actions";
import { toast } from "sonner";
import {
  isPushApiAvailable,
  likelyLacksGooglePlayServices,
  needsIosInstallForPush,
} from "@/components/pwa/device";
import { enablePushNotifications } from "@/components/pwa/enable-push";
import { describePushEnableError } from "@/components/pwa/push-errors";
import { syncLocalPushSubscription } from "@/components/pwa/push-utils";

export function PushNotificationToggle({
  vapidPublicKey,
  onPreferDailyDigestOff,
}: {
  vapidPublicKey: string;
  onPreferDailyDigestOff?: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [supported, setSupported] = useState(false);
  const [needsIosInstall, setNeedsIosInstall] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showDisableWarning, setShowDisableWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = isPushApiAvailable();
      setSupported(ok);
      setNeedsIosInstall(needsIosInstallForPush());
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

  if (likelyLacksGooglePlayServices()) {
    return (
      <p className="text-sm text-muted">
        This Huawei phone does not include Google Play Services, so Chrome cannot deliver lock-screen web push alerts.
        You will still see in-app notifications when you open InstallBase.
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
      const result = await enablePushNotifications(vapidPublicKey);
      setPermission(result.permission);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSubscribed(true);
      toast.success("Alerts enabled on this device");
    } catch (error) {
      console.error("Enable push failed:", error);
      toast.error(describePushEnableError(error));
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
      setShowDisableWarning(false);
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
        Get a phone notification when someone messages you, follows you, or interacts with your posts. This does not
        include the once-a-day community digest — that is controlled separately below.
        {permission === "denied" && " Notifications are blocked in browser settings — allow them for this site, then try again."}
      </p>
      <div className="flex flex-wrap gap-2">
        {subscribed ? (
          <>
            <Button
              variant="outline"
              onClick={() => setShowDisableWarning(true)}
              disabled={busy || showDisableWarning}
            >
              <BellOff className="h-4 w-4" />
              Disable alerts
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

      {showDisableWarning ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            You will stop getting message alerts
          </p>
          <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/80">
            Disabling alerts turns off <strong>all</strong> phone notifications on this device — including direct
            messages, follows, and comments. You will still see these in Activity when you open InstallBase.
          </p>
          <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-100/80">
            If you only want fewer notifications, turn off <strong>Daily community updates</strong> instead — your
            message alerts will keep working.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {onPreferDailyDigestOff ? (
              <Button
                size="sm"
                onClick={() => {
                  setShowDisableWarning(false);
                  onPreferDailyDigestOff();
                }}
                disabled={busy}
              >
                Turn off daily updates only
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setShowDisableWarning(false)} disabled={busy}>
              Keep alerts on
            </Button>
            <Button size="sm" variant="destructive" onClick={disable} disabled={busy}>
              {busy ? "Disabling…" : "Disable all alerts"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  NOTIFY_PROMPT_DISMISS_KEY,
  isPushApiAvailable,
  needsIosInstallForPush,
} from "@/components/pwa/device";
import { enablePushNotifications } from "@/components/pwa/enable-push";
import { syncLocalPushSubscription } from "@/components/pwa/push-utils";

export function NotificationPrompt({ vapidPublicKey }: { vapidPublicKey: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!vapidPublicKey) return;
    if (pathname === "/settings" || pathname === "/notifications") return;
    if (!isPushApiAvailable() || needsIosInstallForPush()) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(NOTIFY_PROMPT_DISMISS_KEY) === "1") return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      syncLocalPushSubscription()
        .then((already) => {
          if (!cancelled && !already && Notification.permission === "default") {
            setVisible(true);
          }
        })
        .catch(() => {
          if (!cancelled) setVisible(true);
        });
    }, 1400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname, vapidPublicKey]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(NOTIFY_PROMPT_DISMISS_KEY, "1");
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const result = await enablePushNotifications(vapidPublicKey);
      if (!result.ok) {
        toast.error(result.error);
        if (result.permission === "denied") dismiss();
        return;
      }
      localStorage.setItem(NOTIFY_PROMPT_DISMISS_KEY, "1");
      setVisible(false);
      toast.success("Alerts enabled on this device");
    } catch (error) {
      console.error("Enable push failed:", error);
      toast.error("Could not enable notifications");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[70] px-3 md:bottom-4">
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Turn on alerts</p>
          <p className="mt-0.5 text-xs text-muted">
            Get a ping when someone messages you, follows you, or comments on a job.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={enable} disabled={busy}>
              <Bell className="h-3.5 w-3.5" />
              {busy ? "Enabling..." : "Enable alerts"}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} disabled={busy}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1 text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

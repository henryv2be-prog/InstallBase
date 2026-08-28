"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "ib-install-dismissed";

export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    setIsIOS(ios);
    setStandalone(installed);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || dismissed) return null;
  if (!deferred && !isIOS) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] px-3 md:bottom-4">
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-mono text-sm font-bold text-white">
          IB
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install InstallBase</p>
          {isIOS ? (
            <p className="mt-0.5 text-xs text-muted">
              Tap <Share className="inline h-3 w-3" /> Share, then{" "}
              <strong>Add to Home Screen</strong> for app-like use.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted">Add to your home screen for a faster, full-screen experience.</p>
          )}
          {!isIOS && deferred && (
            <Button size="sm" className="mt-2" onClick={install}>
              <Download className="h-3.5 w-3.5" />
              Install
            </Button>
          )}
        </div>
        <button type="button" onClick={dismiss} className="rounded-lg p-1 text-muted hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

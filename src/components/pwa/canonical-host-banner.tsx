"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOMAIN_PROMPT_DISMISS_KEY, isWrongDomain } from "@/components/pwa/device";

export function CanonicalHostBanner({ canonicalHost }: { canonicalHost: string | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canonicalHost || !isWrongDomain(canonicalHost)) return;
    if (localStorage.getItem(DOMAIN_PROMPT_DISMISS_KEY) === "1") return;
    setVisible(true);
  }, [canonicalHost]);

  if (!visible || !canonicalHost) return null;

  const correctUrl = `https://${canonicalHost}${window.location.pathname}${window.location.search}`;

  const dismiss = () => {
    localStorage.setItem(DOMAIN_PROMPT_DISMISS_KEY, "1");
    setVisible(false);
  };

  const openCorrect = () => {
    window.location.assign(correctUrl);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[80] px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-50 p-3 text-amber-950 shadow-xl dark:border-amber-400/30 dark:bg-amber-950/90 dark:text-amber-50">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Use the correct link to install</p>
          <p className="mt-0.5 text-xs opacity-90">
            You opened an old link ({window.location.hostname}). Install and alerts only work on{" "}
            <strong>{canonicalHost}</strong>.
          </p>
          <Button size="sm" className="mt-2" onClick={openCorrect}>
            Open {canonicalHost}
          </Button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1 opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

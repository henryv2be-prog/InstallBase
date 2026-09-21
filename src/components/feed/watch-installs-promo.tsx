"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WELCOME_DISMISS_KEY,
  hasSeenWatchInstallsPromo,
  markWatchInstallsPromoSeen,
} from "@/lib/watch-installs-promo";

interface WatchInstallsFeedEntryProps {
  watchHref: string;
  /** Signed-in users may see the welcome modal first; wait until it is dismissed. */
  waitForWelcomeDismiss?: boolean;
}

export function WatchInstallsFeedEntry({
  watchHref,
  waitForWelcomeDismiss = false,
}: WatchInstallsFeedEntryProps) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [highlightCta, setHighlightCta] = useState(() =>
    typeof window !== "undefined" ? !hasSeenWatchInstallsPromo() : false
  );

  useEffect(() => {
    if (hasSeenWatchInstallsPromo()) return;
    setHighlightCta(true);

    const openPromo = () => {
      setPromoOpen(true);
    };

    if (!waitForWelcomeDismiss) {
      openPromo();
      return;
    }

    if (localStorage.getItem(WELCOME_DISMISS_KEY) === "1") {
      openPromo();
      return;
    }

    const timer = window.setInterval(() => {
      if (localStorage.getItem(WELCOME_DISMISS_KEY) === "1") {
        window.clearInterval(timer);
        openPromo();
      }
    }, 400);

    return () => window.clearInterval(timer);
  }, [waitForWelcomeDismiss]);

  const dismissPromo = () => {
    setPromoOpen(false);
  };

  const tryWatch = () => {
    markWatchInstallsPromoSeen();
    setPromoOpen(false);
    setHighlightCta(false);
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Feed view</p>
        <Link
          href={watchHref}
          onClick={tryWatch}
          className={cn(
            "relative rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-shadow",
            highlightCta && "animate-pulse shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/80 ring-offset-2 ring-offset-background"
          )}
        >
          Watch installs
        </Link>
      </div>

      {promoOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="dialog"
          aria-labelledby="watch-installs-promo-title"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-card p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                <Play className="h-5 w-5 pl-0.5" />
              </div>
              <button
                type="button"
                onClick={dismissPromo}
                className="rounded-lg p-1 text-muted hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 id="watch-installs-promo-title" className="text-xl font-bold">
              New: Watch installs
            </h2>
            <p className="mt-2 text-sm text-muted">
              Swipe through real installation work full-screen — videos and photo stories from
              installers, with brag points and comments built in.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-card/80 p-3 text-sm text-muted">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
              <p>Best on your phone: open Watch installs and swipe up for the next job.</p>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="min-h-11 flex-1">
                <Link href={watchHref} onClick={tryWatch}>
                  Try Watch installs
                </Link>
              </Button>
              <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={dismissPromo}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Call on the watch page so visiting counts as discovering the feature. */
export function WatchInstallsPromoSeenOnMount() {
  useEffect(() => {
    markWatchInstallsPromoSeen();
  }, []);
  return null;
}

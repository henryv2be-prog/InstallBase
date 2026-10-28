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
  newLookHref: string;
  /** On classic feed — show link back to New look instead of promo CTA. */
  showClassicHint?: boolean;
  waitForWelcomeDismiss?: boolean;
}

export function WatchInstallsFeedEntry({
  newLookHref,
  showClassicHint = false,
  waitForWelcomeDismiss = false,
}: WatchInstallsFeedEntryProps) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [highlightCta, setHighlightCta] = useState(false);

  useEffect(() => {
    if (showClassicHint) return;
    if (hasSeenWatchInstallsPromo()) return;
    setHighlightCta(true);

    const openPromo = () => setPromoOpen(true);

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
  }, [waitForWelcomeDismiss, showClassicHint]);

  if (showClassicHint) {
    return (
      <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-card/50 px-3 py-2">
        <p className="text-sm text-muted">You&apos;re on the classic feed.</p>
        <Link
          href={newLookHref}
          className="shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm"
        >
          New look
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Feed view</p>
        <Link
          href={newLookHref}
          onClick={() => markWatchInstallsPromoSeen()}
          className={cn(
            "relative rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-shadow",
            highlightCta &&
              "animate-pulse shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400/80 ring-offset-2 ring-offset-background"
          )}
        >
          New look
        </Link>
      </div>

      {promoOpen && (
        <div
          className="fixed inset-0 z-[75] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="dialog"
          aria-labelledby="new-look-promo-title"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-card p-6 shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setPromoOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-muted/30"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 id="new-look-promo-title" className="mt-4 text-lg font-bold">
              Try the New look feed
            </h2>
            <p className="mt-2 text-sm text-muted">
              Full-screen vertical installs — swipe up for the next job, brag, and comment without leaving the feed.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Play className="h-3.5 w-3.5" />
              <p>Best on your phone: open New look and swipe up for the next install.</p>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1" onClick={() => markWatchInstallsPromoSeen()}>
                <Link href={newLookHref}>Try New look</Link>
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setPromoOpen(false)}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function WatchInstallsPromoSeenOnMount() {
  useEffect(() => {
    markWatchInstallsPromoSeen();
  }, []);
  return null;
}

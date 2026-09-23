"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { scrollImmersiveFeedToTop } from "@/components/feed/immersive/immersive-feed-scroll";

interface WatchFeedMobileChromeProps {
  followingTab: boolean;
  userId?: string;
  classicHref: string;
}

export function WatchFeedMobileChrome({
  followingTab,
  userId,
  classicHref,
}: WatchFeedMobileChromeProps) {
  const scrollToTop = () => {
    requestAnimationFrame(() => scrollImmersiveFeedToTop("smooth"));
  };

  return (
    <div className="immersive-watch-top-chrome pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pb-2 pt-1 lg:hidden">
      <div className="mobile-nav-glass-dock pointer-events-auto flex min-h-[2.875rem] items-center justify-between gap-2 rounded-2xl p-1.5">
        <Link
          href={classicHref}
          className="shrink-0 rounded-xl px-2.5 py-2 text-sm font-medium leading-none text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          Classic feed
        </Link>
        <div className="flex min-w-0 shrink items-center gap-2">
          <span className="text-xs font-semibold text-white/90">New look</span>
          <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs font-semibold">
            <Link
              href="/feed/watch?tab=popular"
              onClick={scrollToTop}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg px-3 py-2 leading-none transition-colors",
                !followingTab
                  ? "mobile-nav-glass-btn-active text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              Popular
            </Link>
            {userId ? (
              <Link
                href="/feed/watch?tab=following"
                onClick={scrollToTop}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-lg px-3 py-2 leading-none transition-colors",
                  followingTab
                    ? "mobile-nav-glass-btn-active text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                Following
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

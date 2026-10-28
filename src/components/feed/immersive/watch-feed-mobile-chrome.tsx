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
  const onPopularClick = (e: React.MouseEvent) => {
    if (!followingTab) {
      e.preventDefault();
    }
    scrollImmersiveFeedToTop("instant");
  };

  const onFollowingClick = (e: React.MouseEvent) => {
    if (followingTab) {
      e.preventDefault();
    }
    scrollImmersiveFeedToTop("instant");
  };

  return (
    <div className="immersive-watch-top-chrome pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pb-2 pt-1 lg:hidden">
      <div className="glass-card glass-frost-panel mobile-frost-dock pointer-events-auto flex min-h-[2.875rem] items-center justify-between gap-2 rounded-2xl p-1.5">
        <Link
          href={classicHref}
          className="shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium leading-none text-muted transition-colors hover:text-foreground"
        >
          Classic feed
        </Link>
        <div className="flex min-w-0 shrink items-center gap-2">
          <span className="text-xs font-semibold text-foreground/90">New look</span>
          <div className="classic-feed-tab-rail shrink-0 text-xs font-semibold">
            <Link
              href="/feed/watch?tab=popular"
              onClick={onPopularClick}
              className={cn(
                "classic-feed-tab inline-flex min-h-9 items-center px-3 py-2",
                !followingTab && "classic-feed-tab-active"
              )}
            >
              Popular
            </Link>
            {userId ? (
              <Link
                href="/feed/watch?tab=following"
                onClick={onFollowingClick}
                className={cn(
                  "classic-feed-tab inline-flex min-h-9 items-center px-3 py-2",
                  followingTab && "classic-feed-tab-active"
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

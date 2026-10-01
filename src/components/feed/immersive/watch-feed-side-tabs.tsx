"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { scrollImmersiveFeedToTop } from "@/components/feed/immersive/immersive-feed-scroll";

interface WatchFeedSideTabsProps {
  followingTab: boolean;
  userId?: string;
}

export function WatchFeedSideTabs({ followingTab, userId }: WatchFeedSideTabsProps) {
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
    <div className="flex rounded-xl border border-border bg-card/80 p-1">
      <Link
        href="/feed/watch?tab=popular"
        onClick={onPopularClick}
        className={cn(
          "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
          !followingTab ? "bg-card shadow-sm" : "text-muted"
        )}
      >
        Popular
      </Link>
      {userId ? (
        <Link
          href="/feed/watch?tab=following"
          onClick={onFollowingClick}
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
            followingTab ? "bg-card shadow-sm" : "text-muted"
          )}
        >
          Following
        </Link>
      ) : null}
    </div>
  );
}

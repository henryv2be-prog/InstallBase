"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { requestFeedReset } from "@/lib/feed-refresh";

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Feed page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 py-8">
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-semibold">Feed needs a refresh</h2>
        <p className="mt-2 text-sm text-muted">
          Something went wrong while loading the feed. Pull down to refresh or use the buttons below.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            onClick={() => {
              requestFeedReset();
              reset();
            }}
          >
            Try again
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.assign("/feed")}>
            Reload feed
          </Button>
        </div>
      </div>
    </div>
  );
}

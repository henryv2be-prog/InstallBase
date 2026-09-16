"use client";

import { useState } from "react";
import { FeedErrorBoundary } from "@/components/feed/feed-error-boundary";
import { InfinitePostFeed } from "@/components/feed/infinite-post-feed";
import type { ComponentProps } from "react";

type InfiniteFeedShellProps = ComponentProps<typeof InfinitePostFeed>;

export function InfiniteFeedShell(props: InfiniteFeedShellProps) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <FeedErrorBoundary onReset={() => setResetKey((key) => key + 1)}>
      <InfinitePostFeed key={resetKey} {...props} />
    </FeedErrorBoundary>
  );
}

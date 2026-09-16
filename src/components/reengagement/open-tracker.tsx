"use client";

import { useEffect, useRef } from "react";

interface ReengagementOpenTrackerProps {
  refParam?: string;
  notificationId?: string;
}

export function ReengagementOpenTracker({ refParam, notificationId }: ReengagementOpenTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || refParam !== "daily-reengagement") return;
    tracked.current = true;

    fetch("/api/analytics/reengagement-open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
      keepalive: true,
    }).catch(() => undefined);
  }, [refParam, notificationId]);

  return null;
}

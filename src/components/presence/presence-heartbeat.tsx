"use client";

import { useEffect } from "react";
import { pingPresence } from "@/lib/actions";

export function PresenceHeartbeat() {
  useEffect(() => {
    const ping = () => {
      if (document.visibilityState === "hidden") return;
      pingPresence().catch(() => undefined);
    };

    ping();
    const interval = window.setInterval(ping, 40_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}

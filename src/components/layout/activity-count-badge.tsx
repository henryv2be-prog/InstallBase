"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CountBadge } from "@/components/ui/count-badge";

export function ActivityCountBadge({ className }: { className?: string }) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/activity/count", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : { total: 0 }))
        .then((data) => {
          if (!cancelled) setCount(typeof data.total === "number" ? data.total : 0);
        })
        .catch(() => undefined);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return <CountBadge count={count} className={className} />;
}

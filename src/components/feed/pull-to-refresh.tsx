"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const startY = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (refreshing || window.scrollY > 0) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPull(Math.min(delta, 80));
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (pull > 60 && !refreshing) {
      setRefreshing(true);
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPull(0);
      }, 600);
    } else {
      setPull(0);
    }
  }, [pull, refreshing, router]);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {(pull > 0 || refreshing) && (
        <div
          className="flex items-center justify-center text-muted transition-all"
          style={{ height: refreshing ? 40 : pull * 0.5 }}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </div>
      )}
      {children}
    </div>
  );
}

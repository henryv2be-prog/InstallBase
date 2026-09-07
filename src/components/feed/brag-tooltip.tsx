"use client";

import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRAG_TIP_KEY = "ib-brag-tip-seen";

export function BragTooltip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(BRAG_TIP_KEY) !== "1") {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(BRAG_TIP_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-600">
        <Trophy className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">What are Brag Points?</p>
        <p className="mt-1 text-sm text-muted">
          Tap the trophy on any install photo to give credit for great work. Top installs earn Brag of the Week.
        </p>
        <Button size="sm" variant="outline" className="mt-2" onClick={dismiss}>
          Got it
        </Button>
      </div>
      <button type="button" onClick={dismiss} className="shrink-0 rounded-lg p-1 text-muted hover:bg-card" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

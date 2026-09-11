"use client";

import { useState } from "react";
import { formatNumber, getReputationLabel } from "@/lib/utils";
import type { ReputationLevel } from "@/generated/prisma/client";

export function ReputationBadge({
  score,
  level,
}: {
  score: number;
  level?: ReputationLevel | string;
}) {
  const [open, setOpen] = useState(false);
  const label = level ? getReputationLabel(level as ReputationLevel) : "Installer";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-400"
        aria-label={`Reputation score ${formatNumber(score)}. Tap to learn more.`}
      >
        ⭐ {formatNumber(score)}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close reputation info"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-3 text-left text-xs shadow-lg">
            <p className="font-semibold text-foreground">{label}</p>
            <p className="mt-1 text-muted">
              Reputation grows from brag points, helpful answers, and community engagement.
            </p>
          </div>
        </>
      )}
    </span>
  );
}

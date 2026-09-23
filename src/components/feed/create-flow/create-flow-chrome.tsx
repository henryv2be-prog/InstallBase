"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CreateFlowPathOptions,
  CreateFlowStep,
  FlowPostKind,
} from "@/components/feed/create-flow/types";
import { progressForStep } from "@/components/feed/create-flow/types";

interface CreateFlowChromeProps {
  step: CreateFlowStep;
  flowKind: FlowPostKind | null;
  pathOptions?: CreateFlowPathOptions;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function CreateFlowChrome({
  step,
  flowKind,
  pathOptions,
  onBack,
  showBack = true,
  className,
}: CreateFlowChromeProps) {
  const { index, total } = progressForStep(step, flowKind, pathOptions);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]",
        className
      )}
    >
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50 motion-reduce:transition-none"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <span className="h-11 w-11 shrink-0" aria-hidden />
      )}

      <div
        className="pointer-events-none flex flex-1 items-center justify-center gap-1.5 pt-2"
        role="progressbar"
        aria-valuenow={index}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${index} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all motion-reduce:transition-none",
              i + 1 === index ? "w-6 bg-primary" : i + 1 < index ? "w-2 bg-primary/50" : "w-2 bg-white/25"
            )}
          />
        ))}
      </div>

      <span className="h-11 w-11 shrink-0" aria-hidden />
    </div>
  );
}

"use client";

import { Check, Clapperboard, ImageIcon, Loader2, Lock, Radio, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateFlowStep, FlowPostKind } from "@/components/feed/create-flow/types";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";
import {
  publishMilestoneState,
  type PublishMilestonePhase,
} from "@/components/feed/create-flow/publish-milestone-state";

export { publishMilestoneState, type PublishMilestonePhase };

const MILESTONES: { id: PublishMilestonePhase; Icon: typeof ImageIcon }[] = [
  { id: "media", Icon: ImageIcon },
  { id: "video", Icon: Clapperboard },
  { id: "live", Icon: Radio },
];

interface CreateFlowPublishMilestonesProps {
  step: CreateFlowStep;
  flowKind: FlowPostKind | null;
  compilationStatus: CompilationStatus;
  className?: string;
  /** Compact strip under immersive chrome */
  compact?: boolean;
  /** Immersive create uses light-on-dark; legacy compose uses card colors */
  surface?: "immersive" | "card";
}

export function CreateFlowPublishMilestones({
  step,
  flowKind,
  compilationStatus,
  className,
  compact,
  surface = "immersive",
}: CreateFlowPublishMilestonesProps) {
  const state = publishMilestoneState(step, flowKind, compilationStatus);
  if (!state.show) return null;

  const onLiveStep = state.activeIndex === 2 && step === "caption";
  const onCard = surface === "card";

  return (
    <div
      className={cn(
        "pointer-events-none flex flex-col items-center gap-1",
        className
      )}
      role="group"
      aria-label="Post progress: photos, video, then publish to go live"
    >
      <div className="flex w-full max-w-xs items-center justify-between gap-1 px-1">
        {MILESTONES.map((milestone, index) => {
          const done = index <= state.completedThrough;
          const active = index === state.activeIndex;
          const working = milestone.id === "video" && state.videoWorking && active;
          const failed = milestone.id === "video" && state.videoFailed;
          const Icon = milestone.Icon;

          return (
            <div key={milestone.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                    onCard &&
                      done &&
                      "border-emerald-600/80 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
                    onCard &&
                      !done &&
                      active &&
                      !failed &&
                      "border-primary bg-primary/15 text-foreground",
                    onCard &&
                      !done &&
                      active &&
                      failed &&
                      "border-destructive/70 bg-destructive/10 text-destructive",
                    onCard && !done && !active && "border-border bg-muted/60 text-muted-foreground",
                    !onCard && done && "border-emerald-400/90 bg-emerald-500/25 text-emerald-100",
                    !onCard && !done && active && !failed && "border-primary bg-primary/20 text-white",
                    !onCard && !done && active && failed && "border-red-400/80 bg-red-500/20 text-red-100",
                    !onCard && !done && !active && "border-white/20 bg-black/30 text-white/45",
                    onLiveStep &&
                      index === 2 &&
                      "animate-pulse ring-2 ring-primary/50 ring-offset-2",
                    onLiveStep && index === 2 && (onCard ? "ring-offset-background" : "ring-offset-black/40")
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  ) : working ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden />
                  )}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                      onCard ? "bg-foreground text-background" : "bg-black/80 text-white"
                    )}
                  >
                    {index + 1}
                  </span>
                </span>
              </div>
              {index < MILESTONES.length - 1 && (
                <div
                  className={cn(
                    "mx-0.5 h-0.5 min-w-[1rem] flex-1 rounded-full",
                    index < state.completedThrough
                      ? onCard
                        ? "bg-emerald-500/60"
                        : "bg-emerald-400/70"
                      : onCard
                        ? "bg-border"
                        : "bg-white/20"
                  )}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      <p
        className={cn(
          "flex items-center justify-center gap-1.5",
          onCard ? "text-muted-foreground" : "text-white/75",
          compact ? "min-h-[14px]" : "min-h-[18px]"
        )}
      >
        {onLiveStep ? (
          <>
            <Send className={cn("text-primary", compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden />
            <span
              className={cn(
                "rounded-full bg-primary px-1.5 font-bold text-primary-foreground",
                compact ? "text-[9px]" : "text-[10px]"
              )}
              aria-hidden
            >
              3
            </span>
          </>
        ) : state.videoWorking ? (
          <Loader2 className={cn("animate-spin", compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden />
        ) : (
          <>
            <Lock className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden />
            <span className={cn("font-semibold tabular-nums tracking-wide", compact ? "text-[9px]" : "text-[10px]")}>
              1 · 2 · 3
            </span>
          </>
        )}
      </p>
    </div>
  );
}

/** Legacy non-immersive preview: same 3-step model from compilation status only. */
export function InstallVideoPublishMilestones({
  status,
  className,
}: {
  status: CompilationStatus;
  className?: string;
}) {
  const ready = status === "READY";
  const step: CreateFlowStep = ready ? "caption" : "music";

  return (
    <CreateFlowPublishMilestones
      step={step}
      flowKind="auto_video"
      compilationStatus={status}
      className={className}
      compact={false}
      surface="card"
    />
  );
}

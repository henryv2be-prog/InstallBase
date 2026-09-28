import type { CreateFlowStep, FlowPostKind } from "@/components/feed/create-flow/types";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";

export type PublishMilestonePhase = "media" | "video" | "live";

export function publishMilestoneState(
  step: CreateFlowStep,
  flowKind: FlowPostKind | null,
  compilationStatus: CompilationStatus
): {
  completedThrough: number;
  activeIndex: number;
  videoWorking: boolean;
  videoFailed: boolean;
  show: boolean;
} {
  if (flowKind !== "auto_video") {
    return { completedThrough: -1, activeIndex: 0, videoWorking: false, videoFailed: false, show: false };
  }

  const rendering = compilationStatus === "QUEUED" || compilationStatus === "PROCESSING";
  const failed = compilationStatus === "FAILED";
  const ready = compilationStatus === "READY";

  if (step === "intent" || step === "media" || step === "media-ready") {
    return { completedThrough: -1, activeIndex: 0, videoWorking: false, videoFailed: false, show: true };
  }
  if (step === "effects") {
    return {
      completedThrough: 0,
      activeIndex: 1,
      videoWorking: rendering,
      videoFailed: failed,
      show: true,
    };
  }
  if (step === "music") {
    return {
      completedThrough: ready ? 1 : 0,
      activeIndex: ready ? 2 : 1,
      videoWorking: rendering,
      videoFailed: failed,
      show: true,
    };
  }
  if (step === "caption") {
    return {
      completedThrough: 1,
      activeIndex: 2,
      videoWorking: false,
      videoFailed: false,
      show: true,
    };
  }

  return { completedThrough: -1, activeIndex: 0, videoWorking: false, videoFailed: false, show: false };
}

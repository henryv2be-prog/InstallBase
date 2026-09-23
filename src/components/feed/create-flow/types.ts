import type { PostType } from "@/generated/prisma/client";

export type CreateFlowStep = "media" | "post-type" | "content" | "effects" | "music" | "caption";

export type FlowPostKind = "photo_video" | "auto_video" | "question" | "project";

export type CreateFlowMediaItem = {
  id: string;
  previewUrl: string;
  serverUrl?: string;
  kind: "image" | "video";
  status: "uploading" | "ready" | "error";
  progress?: number;
  error?: string;
};

export function flowKindToPostType(kind: FlowPostKind): PostType {
  switch (kind) {
    case "question":
      return "QUESTION";
    case "project":
      return "PROJECT";
    case "auto_video":
      return "POST";
    default:
      return "POST";
  }
}

export function progressForStep(step: CreateFlowStep, kind: FlowPostKind | null): { index: number; total: number } {
  const autoPath: CreateFlowStep[] = ["media", "post-type", "effects", "music", "caption"];
  const shortPath: CreateFlowStep[] = ["media", "post-type", "content"];
  const path = kind === "auto_video" ? autoPath : shortPath;
  const index = Math.max(0, path.indexOf(step));
  return { index: index + 1, total: path.length };
}

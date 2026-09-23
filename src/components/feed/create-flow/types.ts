import type { PostType } from "@/generated/prisma/client";

export type CreateFlowStep =
  | "intent"
  | "media"
  | "media-ready"
  | "video-music"
  | "content"
  | "effects"
  | "music"
  | "caption";

export type CreateFlowPathOptions = {
  /** Standard post path includes music picker when user uploaded video. */
  includeVideoMusic?: boolean;
};

/** User-facing create paths (project is not a create option). */
export type FlowPostKind = "share_work" | "question" | "photo_video" | "auto_video";

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
    case "auto_video":
    case "share_work":
    case "photo_video":
    default:
      return "POST";
  }
}

function pathForKind(kind: FlowPostKind | null, options?: CreateFlowPathOptions): CreateFlowStep[] {
  if (kind === "auto_video") {
    return ["intent", "media", "media-ready", "effects", "music", "caption"];
  }
  if (kind === "question") {
    return ["intent", "media", "content"];
  }
  if (kind === "share_work" || kind === "photo_video") {
    const path: CreateFlowStep[] = ["intent", "media", "media-ready"];
    if (options?.includeVideoMusic) path.push("video-music");
    path.push("content");
    return path;
  }
  return ["intent", "media"];
}

export function progressForStep(
  step: CreateFlowStep,
  kind: FlowPostKind | null,
  options?: CreateFlowPathOptions
): { index: number; total: number } {
  const path = pathForKind(kind, options);
  const index = Math.max(0, path.indexOf(step));
  return { index: index + 1, total: path.length };
}

import type { PostType } from "@/generated/prisma/client";

export const BRAGGABLE_TYPES: PostType[] = ["POST", "VIDEO", "PROJECT", "BRAG"];

export const braggablePostWhere = {
  type: { in: BRAGGABLE_TYPES },
} as const;

export function isBraggableType(type: PostType) {
  return type !== "QUESTION";
}

export function compactBragDetails(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const entries = Object.entries(raw as Record<string, unknown>)
    .map(([key, value]) => [key, String(value ?? "").trim()] as const)
    .filter(([, value]) => value.length > 0);
  return entries.length ? Object.fromEntries(entries) : null;
}

export function normalizeComposerType(type: string | null, mediaUrls: string[]): PostType {
  if (type === "QUESTION" || type === "PROJECT" || type === "VIDEO" || type === "POST") return type;
  const hasVideo = mediaUrls.some((url) => /\.(mp4|webm|mov)(\?|$)/i.test(url));
  return hasVideo ? "VIDEO" : "POST";
}

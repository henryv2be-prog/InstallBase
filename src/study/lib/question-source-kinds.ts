import { StudyContentSourceKind } from "@/generated/prisma/client";

/** Hand-written + parametric practice — never official exam content. */
export const PRACTICE_LIKE_SOURCE_KINDS = [
  StudyContentSourceKind.PRACTICE,
  StudyContentSourceKind.GENERATED_PRACTICE,
] as const;

export function isPracticeLikeSourceKind(kind: StudyContentSourceKind): boolean {
  return (PRACTICE_LIKE_SOURCE_KINDS as readonly StudyContentSourceKind[]).includes(kind);
}

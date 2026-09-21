import type { QuizMode } from "@/study/lib/quiz-types";

/** Pick a mode that actually has questions; prefer learner-friendly practice first. */
export function pickQuizMode(
  preferred: QuizMode,
  officialCount: number,
  practiceCount: number,
  totalCount: number,
): QuizMode {
  const has = (mode: QuizMode) =>
    mode === "official"
      ? officialCount > 0
      : mode === "practice"
        ? practiceCount > 0
        : totalCount > 0;

  if (has(preferred)) return preferred;
  if (practiceCount > 0) return "practice";
  if (officialCount > 0) return "official";
  if (totalCount > 0) return "all";
  return preferred;
}

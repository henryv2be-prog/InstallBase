import type { StudyQuestionType } from "@/generated/prisma/client";

export type GeneratedDifficultyBand = "EASY" | "MEDIUM" | "HARD";

/** Maps to StudyQuestion.difficulty (1–5). */
export function difficultyNumericFromBand(band: GeneratedDifficultyBand): number {
  if (band === "EASY") return 2;
  if (band === "MEDIUM") return 3;
  return 4;
}

export type QuestionGeneratorMeta = {
  generatorId: string;
  generatorVersion: string;
  difficultyBand: GeneratedDifficultyBand;
  skills: string[];
  parameterSeed: string;
};

export type CurriculumTarget = {
  subjectSlug: string;
  topicSlug: string;
  subtopicSlug: string;
};

export type GeneratedQuestionDraft = {
  sourceLabel: string;
  curriculum: CurriculumTarget;
  type: StudyQuestionType;
  difficulty: number;
  difficultyBand: GeneratedDifficultyBand;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  generatorMeta: QuestionGeneratorMeta;
};

export type PracticeQuestionGenerator = {
  id: string;
  version: string;
  curriculum: CurriculumTarget;
  skills: string[];
  /** Deterministic slot keys (e.g. e01, m02) — one validated question each. */
  slots: { key: string; band: GeneratedDifficultyBand }[];
  build: (slotKey: string, band: GeneratedDifficultyBand) => GeneratedQuestionDraft | null;
};

/** Practice + generated count toward coach/quiz "practice" pools — never official. */
export const GENERATED_PRACTICE_MIN_PER_SUBTOPIC = 6;

import type { StudyContentSourceKind, StudyQuestionType } from "@/generated/prisma/client";

export const QUIZ_SIZE = 5;

export type QuizMode = "all" | "official" | "practice";

export type QuizAnswerInput = { questionId: string; selectedOptionId: string };

export type QuizQuestionClient = {
  id: string;
  type: StudyQuestionType;
  sourceKind: StudyContentSourceKind;
  sourceYear: number | null;
  sourcePaperNumber: number | null;
  sourceQuestionRef: string | null;
  officialSourceUrl: string | null;
  prompt: string;
  options: { id: string; text: string }[];
  difficulty: number;
};

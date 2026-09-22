import { readFileSync } from "node:fs";
import { join } from "node:path";

export type CapsPracticeBankQuestion = {
  seedKey: string;
  subjectSlug: string;
  topicSlug: string;
  subtopicSlug: string;
  type?: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  difficulty: number;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  correctAnswerText?: string;
  acceptableAnswers?: string[];
};

type CapsPracticeBankFile = {
  schemaVersion: number;
  questionsPerSubtopic: number;
  questions: CapsPracticeBankQuestion[];
};

let cached: CapsPracticeBankQuestion[] | null = null;

export function loadCapsPracticeBankQuestions(): CapsPracticeBankQuestion[] {
  if (cached) return cached;
  const path = join(process.cwd(), "src/study/data/caps-practice-bank.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as CapsPracticeBankFile;
  cached = raw.questions;
  return cached;
}

export function capsPracticeBankMeta() {
  const path = join(process.cwd(), "src/study/data/caps-practice-bank.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as CapsPracticeBankFile;
  return {
    schemaVersion: raw.schemaVersion,
    questionsPerSubtopic: raw.questionsPerSubtopic,
    totalQuestions: raw.questions.length,
  };
}

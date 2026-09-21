import { StudyQuestionType } from "@/generated/prisma/client";
import type {
  GeneratedDifficultyBand,
  GeneratedQuestionDraft,
  PracticeQuestionGenerator,
} from "@/study/lib/generated-practice/types";
import { difficultyNumericFromBand } from "@/study/lib/generated-practice/types";

const GENERATOR_ID = "math-applications-derivatives";
const VERSION = "1.0.0";

const CURRICULUM = {
  subjectSlug: "mathematics",
  topicSlug: "calculus",
  subtopicSlug: "applications-of-derivatives",
} as const;

const SLOTS: { key: string; band: GeneratedDifficultyBand }[] = [
  { key: "e01", band: "EASY" },
  { key: "e02", band: "EASY" },
  { key: "e03", band: "EASY" },
  { key: "m01", band: "MEDIUM" },
  { key: "m02", band: "MEDIUM" },
  { key: "m03", band: "MEDIUM" },
  { key: "h01", band: "HARD" },
  { key: "h02", band: "HARD" },
];

/** f(x) = ax² + bx + c — turning point at x = -b/(2a) */
function paramsForSlot(slotKey: string): { a: number; b: number; c: number } | null {
  const table: Record<string, { a: number; b: number; c: number }> = {
    e01: { a: 1, b: -4, c: 3 },
    e02: { a: 1, b: -6, c: 5 },
    e03: { a: 2, b: -8, c: 1 },
    m01: { a: -1, b: 2, c: 8 },
    m02: { a: 3, b: -12, c: 9 },
    m03: { a: 1, b: 2, c: -3 },
    h01: { a: -2, b: 12, c: -10 },
    h02: { a: 0.5, b: -3, c: 4 },
  };
  return table[slotKey] ?? null;
}

function formatQuad(a: number, b: number, c: number): string {
  const bx = b === 0 ? "" : b > 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;
  const cx = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
  const ax = a === 1 ? "x²" : a === -1 ? "−x²" : `${a}x²`;
  return `${ax}${bx}${cx}`;
}

function build(slotKey: string, band: GeneratedDifficultyBand): GeneratedQuestionDraft | null {
  const p = paramsForSlot(slotKey);
  if (!p || p.a === 0) return null;

  const xTurn = -p.b / (2 * p.a);
  const isMax = p.a < 0;
  const kind = isMax ? "maximum" : "minimum";
  const correct = xTurn.toString().replace(/\.0$/, "");
  const wrong1 = (xTurn + 1).toString();
  const wrong2 = (xTurn - 1).toString();
  const wrong3 = "0";

  const fStr = formatQuad(p.a, p.b, p.c);

  return {
    sourceLabel: `gen-${GENERATOR_ID}:${slotKey}`,
    curriculum: CURRICULUM,
    type: StudyQuestionType.MULTIPLE_CHOICE,
    difficulty: difficultyNumericFromBand(band),
    difficultyBand: band,
    prompt: `For f(x) = ${fStr}, the x-value at the turning point (${kind}) is:`,
    options: [
      { id: "a", text: `x = ${correct}` },
      { id: "b", text: `x = ${wrong1}` },
      { id: "c", text: `x = ${wrong2}` },
      { id: "d", text: `x = ${wrong3}` },
    ],
    correctOptionId: "a",
    explanation: `f'(x) = ${2 * p.a}x ${p.b >= 0 ? "+" : "−"} ${Math.abs(p.b)} = 0 → x = ${correct}. Since a ${p.a < 0 ? "<" : ">"} 0, this is a ${kind}.`,
    generatorMeta: {
      generatorId: GENERATOR_ID,
      generatorVersion: VERSION,
      difficultyBand: band,
      skills: ["applications-of-derivatives", "turning-points"],
      parameterSeed: slotKey,
    },
  };
}

export const mathApplicationsDerivativesGenerator: PracticeQuestionGenerator = {
  id: GENERATOR_ID,
  version: VERSION,
  curriculum: CURRICULUM,
  skills: ["applications-of-derivatives", "turning-points"],
  slots: SLOTS,
  build,
};

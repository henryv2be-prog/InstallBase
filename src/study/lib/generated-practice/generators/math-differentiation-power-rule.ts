import { StudyQuestionType } from "@/generated/prisma/client";
import type {
  GeneratedDifficultyBand,
  GeneratedQuestionDraft,
  PracticeQuestionGenerator,
} from "@/study/lib/generated-practice/types";
import { difficultyNumericFromBand } from "@/study/lib/generated-practice/types";

const GENERATOR_ID = "math-differentiation-power-rule";
const VERSION = "1.0.0";

const CURRICULUM = {
  subjectSlug: "mathematics",
  topicSlug: "calculus",
  subtopicSlug: "differentiation",
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

/** f(x) = k·x^n, n positive integer, k integer */
function paramsForSlot(slotKey: string): { k: number; n: number } | null {
  const table: Record<string, { k: number; n: number }> = {
    e01: { k: 1, n: 2 },
    e02: { k: 2, n: 3 },
    e03: { k: 3, n: 2 },
    m01: { k: 4, n: 4 },
    m02: { k: -2, n: 3 },
    m03: { k: 5, n: 3 },
    h01: { k: -3, n: 4 },
    h02: { k: 6, n: 5 },
  };
  return table[slotKey] ?? null;
}

function formatPoly(k: number, n: number): string {
  if (k === 1) return n === 1 ? "x" : `x^${n}`;
  if (k === -1) return n === 1 ? "−x" : `−x^${n}`;
  return n === 1 ? `${k}x` : `${k}x^${n}`;
}

function formatDerivative(k: number, n: number): string {
  const coef = k * n;
  const power = n - 1;
  if (power === 0) return `${coef}`;
  if (power === 1) {
    if (coef === 1) return "x";
    if (coef === -1) return "−x";
    return `${coef}x`;
  }
  if (coef === 1) return `x^${power}`;
  if (coef === -1) return `−x^${power}`;
  return `${coef}x^${power}`;
}

function build(slotKey: string, band: GeneratedDifficultyBand): GeneratedQuestionDraft | null {
  const p = paramsForSlot(slotKey);
  if (!p || p.n < 1) return null;

  const correct = formatDerivative(p.k, p.n);
  const wrong1 = formatDerivative(p.k, p.n + 1);
  const wrong2 = formatPoly(p.k, p.n);
  const wrong3 = formatDerivative(p.k + 1, p.n);

  const options = [
    { id: "a", text: `f'(x) = ${correct}` },
    { id: "b", text: `f'(x) = ${wrong1}` },
    { id: "c", text: `f'(x) = ${wrong2}` },
    { id: "d", text: `f'(x) = ${wrong3}` },
  ];

  return {
    sourceLabel: `gen-${GENERATOR_ID}-${slotKey}`,
    curriculum: { ...CURRICULUM },
    type: StudyQuestionType.MULTIPLE_CHOICE,
    difficulty: difficultyNumericFromBand(band),
    difficultyBand: band,
    prompt: `If f(x) = ${formatPoly(p.k, p.n)}, find f'(x) using the power rule.`,
    options,
    correctOptionId: "a",
    explanation: `f'(x) = ${p.k}·${p.n}x^${p.n - 1} = ${correct}.`,
    generatorMeta: {
      generatorId: GENERATOR_ID,
      generatorVersion: VERSION,
      difficultyBand: band,
      skills: ["differentiation", "power-rule"],
      parameterSeed: slotKey,
    },
  };
}

export const mathDifferentiationPowerRuleGenerator: PracticeQuestionGenerator = {
  id: GENERATOR_ID,
  version: VERSION,
  curriculum: { ...CURRICULUM },
  skills: ["differentiation", "power-rule"],
  slots: SLOTS,
  build,
};

import { StudyQuestionType } from "@/generated/prisma/client";
import type {
  GeneratedDifficultyBand,
  GeneratedQuestionDraft,
  PracticeQuestionGenerator,
} from "@/study/lib/generated-practice/types";
import { difficultyNumericFromBand } from "@/study/lib/generated-practice/types";

const GENERATOR_ID = "math-quadratic-roots";
const VERSION = "1.0.0";

const CURRICULUM = {
  subjectSlug: "mathematics",
  topicSlug: "algebra",
  subtopicSlug: "quadratic-equations",
} as const;

const SLOTS: { key: string; band: GeneratedDifficultyBand }[] = [
  { key: "e01", band: "EASY" },
  { key: "e02", band: "EASY" },
  { key: "e03", band: "EASY" },
  { key: "e04", band: "EASY" },
  { key: "m01", band: "MEDIUM" },
  { key: "m02", band: "MEDIUM" },
  { key: "m03", band: "MEDIUM" },
  { key: "m04", band: "MEDIUM" },
  { key: "h01", band: "HARD" },
  { key: "h02", band: "HARD" },
  { key: "h03", band: "HARD" },
  { key: "h04", band: "HARD" },
];

function rootsForSlot(slotKey: string, band: GeneratedDifficultyBand): [number, number] {
  const table: Record<string, [number, number]> = {
    e01: [2, 3],
    e02: [1, 4],
    e03: [-2, 5],
    e04: [3, 3],
    m01: [6, 7],
    m02: [-4, 9],
    m03: [8, -3],
    m04: [-6, -2],
    h01: [11, 12],
    h02: [-8, 15],
    h03: [14, -5],
    h04: [-9, -4],
  };
  const pair = table[slotKey];
  if (pair) return pair;
  if (band === "EASY") return [2, 3];
  if (band === "MEDIUM") return [5, 8];
  return [7, 11];
}

function formatQuadratic(b: number, c: number): string {
  const bPart =
    b === 0 ? "" : b > 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;
  const cPart = c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
  return `x²${bPart}${cPart} = 0`;
}

function verifyRoots(b: number, c: number, r1: number, r2: number): boolean {
  return r1 + r2 === -b && r1 * r2 === c;
}

function build(slotKey: string, band: GeneratedDifficultyBand): GeneratedQuestionDraft | null {
  const [r1, r2] = rootsForSlot(slotKey, band);
  const b = -(r1 + r2);
  const c = r1 * r2;
  if (!verifyRoots(b, c, r1, r2)) return null;

  const correctText =
    r1 === r2 ? `x = ${r1}` : `x = ${r1} or x = ${r2}`;
  const wrong1 = r1 === r2 ? `x = ${r1 + 1}` : `x = ${r1 + r2} or x = ${r1 * r2}`;
  const wrong2 = `x = ${-r1} or x = ${-r2}`;
  const wrong3 = r1 === r2 ? `x = ${-r1}` : `x = ${c} or x = ${b}`;

  const options = [
    { id: "a", text: correctText },
    { id: "b", text: wrong1 },
    { id: "c", text: wrong2 },
    { id: "d", text: wrong3 },
  ];

  return {
    sourceLabel: `gen-${GENERATOR_ID}-${slotKey}`,
    curriculum: { ...CURRICULUM },
    type: StudyQuestionType.MULTIPLE_CHOICE,
    difficulty: difficultyNumericFromBand(band),
    difficultyBand: band,
    prompt: `Solve for x:\n${formatQuadratic(b, c)}`,
    options,
    correctOptionId: "a",
    explanation:
      r1 === r2
        ? `Factorise: (x − ${r1})² = 0, so x = ${r1}.`
        : `Factorise: (x − ${r1})(x − ${r2}) = 0, so x = ${r1} or x = ${r2}.`,
    generatorMeta: {
      generatorId: GENERATOR_ID,
      generatorVersion: VERSION,
      difficultyBand: band,
      skills: ["quadratic-equations", "factorisation", "integer-roots"],
      parameterSeed: slotKey,
    },
  };
}

export const mathQuadraticRootsGenerator: PracticeQuestionGenerator = {
  id: GENERATOR_ID,
  version: VERSION,
  curriculum: { ...CURRICULUM },
  skills: ["quadratic-equations", "factorisation", "integer-roots"],
  slots: SLOTS,
  build,
};

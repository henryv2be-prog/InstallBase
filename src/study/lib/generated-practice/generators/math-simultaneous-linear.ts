import { StudyQuestionType } from "@/generated/prisma/client";
import type {
  GeneratedDifficultyBand,
  GeneratedQuestionDraft,
  PracticeQuestionGenerator,
} from "@/study/lib/generated-practice/types";
import { difficultyNumericFromBand } from "@/study/lib/generated-practice/types";

const GENERATOR_ID = "math-simultaneous-linear";
const VERSION = "1.0.0";

const CURRICULUM = {
  subjectSlug: "mathematics",
  topicSlug: "algebra",
  subtopicSlug: "simultaneous-equations",
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

type System = { x: number; y: number; a1: number; b1: number; c1: number; a2: number; b2: number; c2: number };

function systemForSlot(slotKey: string): System | null {
  const presets: Record<string, System> = {
    e01: { x: 2, y: 3, a1: 1, b1: 1, c1: 5, a2: 1, b2: -1, c2: -1 },
    e02: { x: 4, y: 1, a1: 1, b1: 1, c1: 5, a2: 2, b2: 1, c2: 9 },
    e03: { x: 3, y: 2, a1: 2, b1: 1, c1: 8, a2: 1, b2: 2, c2: 7 },
    m01: { x: 5, y: -2, a1: 2, b1: 3, c1: 4, a2: 3, b2: -1, c2: 17 },
    m02: { x: -3, y: 4, a1: 2, b1: 1, c1: -2, a2: 1, b2: 3, c2: 9 },
    m03: { x: 6, y: 1, a1: 3, b1: 2, c1: 20, a2: 2, b2: -3, c2: 9 },
    h01: { x: 7, y: -4, a1: 4, b1: 1, c1: 24, a2: 2, b2: 3, c2: 2 },
    h02: { x: -5, y: 6, a1: 3, b1: 2, c1: -3, a2: 4, b2: -1, c2: -26 },
  };
  const s = presets[slotKey];
  if (!s) return null;
  if (s.a1 * s.x + s.b1 * s.y !== s.c1 || s.a2 * s.x + s.b2 * s.y !== s.c2) return null;
  const det = s.a1 * s.b2 - s.a2 * s.b1;
  if (det === 0) return null;
  return s;
}

function eqLine(a: number, b: number, c: number): string {
  const parts: string[] = [];
  if (a !== 0) parts.push(a === 1 ? "x" : a === -1 ? "−x" : `${a}x`);
  if (b !== 0) {
    const term = b === 1 ? "y" : b === -1 ? "−y" : `${Math.abs(b)}y`;
    parts.push(b > 0 ? ` + ${term}` : ` − ${term.replace("−", "")}`);
  }
  return `${parts.join("")} = ${c}`;
}

function build(slotKey: string, band: GeneratedDifficultyBand): GeneratedQuestionDraft | null {
  const s = systemForSlot(slotKey);
  if (!s) return null;

  const correctText = `x = ${s.x}, y = ${s.y}`;
  const options = [
    { id: "a", text: correctText },
    { id: "b", text: `x = ${s.y}, y = ${s.x}` },
    { id: "c", text: `x = ${s.x + 1}, y = ${s.y}` },
    { id: "d", text: `x = ${s.x}, y = ${s.y + 1}` },
  ];

  return {
    sourceLabel: `gen-${GENERATOR_ID}-${slotKey}`,
    curriculum: { ...CURRICULUM },
    type: StudyQuestionType.MULTIPLE_CHOICE,
    difficulty: difficultyNumericFromBand(band),
    difficultyBand: band,
    prompt: `Solve the system:\n${eqLine(s.a1, s.b1, s.c1)}\n${eqLine(s.a2, s.b2, s.c2)}`,
    options,
    correctOptionId: "a",
    explanation: `Substitution or elimination gives x = ${s.x} and y = ${s.y}.`,
    generatorMeta: {
      generatorId: GENERATOR_ID,
      generatorVersion: VERSION,
      difficultyBand: band,
      skills: ["simultaneous-equations", "linear-systems"],
      parameterSeed: slotKey,
    },
  };
}

export const mathSimultaneousLinearGenerator: PracticeQuestionGenerator = {
  id: GENERATOR_ID,
  version: VERSION,
  curriculum: { ...CURRICULUM },
  skills: ["simultaneous-equations", "linear-systems"],
  slots: SLOTS,
  build,
};

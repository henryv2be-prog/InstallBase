import { StudyQuestionType } from "@/generated/prisma/client";
import type {
  GeneratedDifficultyBand,
  GeneratedQuestionDraft,
  PracticeQuestionGenerator,
} from "@/study/lib/generated-practice/types";
import { difficultyNumericFromBand } from "@/study/lib/generated-practice/types";

const GENERATOR_ID = "math-trig-equations";
const VERSION = "1.0.0";

const CURRICULUM = {
  subjectSlug: "mathematics",
  topicSlug: "trigonometry",
  subtopicSlug: "trigonometric-equations",
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

type TrigEq = {
  prompt: string;
  correct: string;
  wrong: [string, string, string];
  explanation: string;
};

function eqForSlot(slotKey: string): TrigEq | null {
  const table: Record<string, TrigEq> = {
    e01: {
      prompt: "Solve for x ∈ [0°; 360°]: sin x = 0",
      correct: "0°, 180°, 360°",
      wrong: ["90°, 270°", "180° only", "0° only"],
      explanation: "sin x = 0 at 0°, 180° and 360° in the interval.",
    },
    e02: {
      prompt: "Solve for x ∈ [0°; 360°]: cos x = 1",
      correct: "0°, 360°",
      wrong: ["90°, 270°", "180° only", "0° only"],
      explanation: "cos x = 1 at 0° and 360°.",
    },
    e03: {
      prompt: "Solve for x ∈ [0°; 360°]: sin x = 1",
      correct: "90°",
      wrong: ["270°", "0° and 180°", "45° and 135°"],
      explanation: "Maximum of sine at 90°.",
    },
    m01: {
      prompt: "Solve for x ∈ [0°; 360°]: 2 sin x = 1",
      correct: "30°, 150°",
      wrong: ["60°, 300°", "45°, 135°", "210°, 330°"],
      explanation: "sin x = 1/2 → reference 30°, solutions in QI and QII.",
    },
    m02: {
      prompt: "Solve for x ∈ [0°; 360°]: 2 cos x = −1",
      correct: "120°, 240°",
      wrong: ["60°, 300°", "90°, 270°", "180° only"],
      explanation: "cos x = −1/2 → 120° and 240°.",
    },
    m03: {
      prompt: "Solve for x ∈ [0°; 360°]: sin x = −1",
      correct: "270°",
      wrong: ["90°", "180°", "0°"],
      explanation: "sin x = −1 only at 270° in the interval.",
    },
    h01: {
      prompt: "Solve for x ∈ [0°; 360°]: sin x = cos x",
      correct: "45°, 225°",
      wrong: ["90°, 270°", "0°, 180°", "30°, 150°"],
      explanation: "tan x = 1 → x = 45° + 180°k → 45°, 225°.",
    },
    h02: {
      prompt: "Solve for x ∈ [0°; 360°]: 2 sin² x = 1",
      correct: "45°, 135°, 225°, 315°",
      wrong: ["30°, 150°", "0°, 180°", "60°, 120°"],
      explanation: "sin² x = 1/2 → sin x = ±√2/2 → four solutions in the interval.",
    },
  };
  return table[slotKey] ?? null;
}

function build(slotKey: string, band: GeneratedDifficultyBand): GeneratedQuestionDraft | null {
  const eq = eqForSlot(slotKey);
  if (!eq) return null;

  return {
    sourceLabel: `gen-${GENERATOR_ID}:${slotKey}`,
    curriculum: CURRICULUM,
    type: StudyQuestionType.MULTIPLE_CHOICE,
    difficulty: difficultyNumericFromBand(band),
    difficultyBand: band,
    prompt: eq.prompt,
    options: [
      { id: "a", text: eq.correct },
      { id: "b", text: eq.wrong[0] },
      { id: "c", text: eq.wrong[1] },
      { id: "d", text: eq.wrong[2] },
    ],
    correctOptionId: "a",
    explanation: eq.explanation,
    generatorMeta: {
      generatorId: GENERATOR_ID,
      generatorVersion: VERSION,
      difficultyBand: band,
      skills: ["trigonometric-equations"],
      parameterSeed: slotKey,
    },
  };
}

export const mathTrigEquationsGenerator: PracticeQuestionGenerator = {
  id: GENERATOR_ID,
  version: VERSION,
  curriculum: CURRICULUM,
  skills: ["trigonometric-equations"],
  slots: SLOTS,
  build,
};

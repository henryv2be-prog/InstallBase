import { mathDifferentiationPowerRuleGenerator } from "@/study/lib/generated-practice/generators/math-differentiation-power-rule";
import { mathQuadraticRootsGenerator } from "@/study/lib/generated-practice/generators/math-quadratic-roots";
import { mathSimultaneousLinearGenerator } from "@/study/lib/generated-practice/generators/math-simultaneous-linear";
import type { PracticeQuestionGenerator } from "@/study/lib/generated-practice/types";

/** High-confidence generators only — expand deliberately over time. */
export const PRACTICE_GENERATOR_REGISTRY: PracticeQuestionGenerator[] = [
  mathQuadraticRootsGenerator,
  mathSimultaneousLinearGenerator,
  mathDifferentiationPowerRuleGenerator,
];

import { PRACTICE_GENERATOR_REGISTRY } from "@/study/lib/generated-practice/registry";
import { validateGeneratedQuestion } from "@/study/lib/generated-practice/validate";
import type { GeneratedQuestionDraft } from "@/study/lib/generated-practice/types";

export function buildAllValidatedGeneratedDrafts(): GeneratedQuestionDraft[] {
  const out: GeneratedQuestionDraft[] = [];
  for (const gen of PRACTICE_GENERATOR_REGISTRY) {
    for (const slot of gen.slots) {
      const draft = gen.build(slot.key, slot.band);
      if (!draft) continue;
      const check = validateGeneratedQuestion(draft);
      if (!check.ok) continue;
      out.push(draft);
    }
  }
  return out;
}

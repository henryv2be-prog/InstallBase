import type { GeneratedQuestionDraft } from "@/study/lib/generated-practice/types";

export type ValidationResult = { ok: true } | { ok: false; reason: string };

export function validateGeneratedQuestion(draft: GeneratedQuestionDraft): ValidationResult {
  if (!draft.sourceLabel.startsWith("gen-")) {
    return { ok: false, reason: "sourceLabel must use gen- prefix" };
  }
  if (draft.prompt.trim().length < 8) {
    return { ok: false, reason: "prompt too short" };
  }
  if (draft.difficulty < 1 || draft.difficulty > 5) {
    return { ok: false, reason: "difficulty out of range" };
  }
  if (draft.options.length < 4) {
    return { ok: false, reason: "need at least 4 options" };
  }
  const texts = draft.options.map((o) => o.text.trim());
  if (new Set(texts).size !== texts.length) {
    return { ok: false, reason: "duplicate option text" };
  }
  const ids = new Set(draft.options.map((o) => o.id));
  if (ids.size !== draft.options.length) {
    return { ok: false, reason: "duplicate option ids" };
  }
  if (!draft.options.some((o) => o.id === draft.correctOptionId)) {
    return { ok: false, reason: "correctOptionId not in options" };
  }
  if (!draft.explanation.trim()) {
    return { ok: false, reason: "missing explanation" };
  }
  if (draft.generatorMeta.generatorId.length === 0) {
    return { ok: false, reason: "missing generator id" };
  }
  const c = draft.curriculum;
  if (!c.subjectSlug || !c.topicSlug || !c.subtopicSlug) {
    return { ok: false, reason: "incomplete curriculum mapping" };
  }
  return { ok: true };
}

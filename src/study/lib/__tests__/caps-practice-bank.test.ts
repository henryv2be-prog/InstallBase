import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { curriculumSubtopicKeys } from "@/study/lib/nsc-import/curriculum-nsc-coverage";
import {
  capsPracticeBankMeta,
  loadCapsPracticeBankQuestions,
} from "@/study/lib/load-caps-practice-bank";

describe("CAPS practice bank", () => {
  it("has six practice items for every curriculum subtopic", () => {
    const meta = capsPracticeBankMeta();
    const questions = loadCapsPracticeBankQuestions();
    assert.equal(meta.questionsPerSubtopic, 6);
    assert.equal(questions.length, meta.totalQuestions);

    const counts = new Map<string, number>();
    for (const q of questions) {
      const key = `${q.subjectSlug}/${q.topicSlug}/${q.subtopicSlug}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const curriculumKeys = curriculumSubtopicKeys();
    assert.equal(counts.size, curriculumKeys.length);

    for (const key of curriculumKeys) {
      assert.equal(
        counts.get(key),
        6,
        `Expected 6 practice questions for ${key}, got ${counts.get(key) ?? 0}`,
      );
    }
  });

  it("uses unique seed keys", () => {
    const questions = loadCapsPracticeBankQuestions();
    const keys = new Set(questions.map((q) => q.seedKey));
    assert.equal(keys.size, questions.length);
  });
});

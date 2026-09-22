import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  quizPickProfileForRecommendationAction,
  selectQuestionsForQuiz,
} from "@/study/lib/select-quiz-questions";

describe("selectQuestionsForQuiz", () => {
  const pool = [
    { id: "a", difficulty: 1 },
    { id: "b", difficulty: 2 },
    { id: "c", difficulty: 3 },
    { id: "d", difficulty: 4 },
    { id: "e", difficulty: 5 },
  ];

  it("returns at most the requested size", () => {
    const picked = selectQuestionsForQuiz(pool, 3, "default", 50);
    assert.equal(picked.length, 3);
  });

  it("harder profile skews toward higher difficulty", () => {
    const picked = selectQuestionsForQuiz(pool, 3, "harder");
    const avg = picked.reduce((s, q) => s + q.difficulty, 0) / picked.length;
    assert.ok(avg >= 3.5);
  });

  it("easier profile skews toward lower difficulty", () => {
    const picked = selectQuestionsForQuiz(pool, 3, "easier");
    const avg = picked.reduce((s, q) => s + q.difficulty, 0) / picked.length;
    assert.ok(avg <= 2.5);
  });
});

describe("quizPickProfileForRecommendationAction", () => {
  it("maps harder action", () => {
    assert.equal(quizPickProfileForRecommendationAction("TRY_HARDER_QUESTIONS"), "harder");
  });
});

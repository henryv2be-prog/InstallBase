import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickQuizMode } from "@/study/lib/quiz-mode-pick";

describe("pickQuizMode", () => {
  it("falls back to practice when official is empty", () => {
    assert.equal(pickQuizMode("official", 0, 5, 5), "practice");
  });

  it("keeps official when available", () => {
    assert.equal(pickQuizMode("official", 3, 5, 8), "official");
  });
});

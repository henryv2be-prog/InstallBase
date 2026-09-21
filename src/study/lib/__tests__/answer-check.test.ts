import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { answersMatch } from "@/study/lib/answer-check";

describe("answersMatch", () => {
  it("matches equivalent short answers", () => {
    assert.equal(answersMatch("x = 5 or x = -1", ["x=5,x=-1", "5;-1"]), true);
  });

  it("matches numeric answers", () => {
    assert.equal(answersMatch("2160", ["R2160", "2160"]), true);
  });

  it("rejects wrong answers", () => {
    assert.equal(answersMatch("x = 1", ["x=5,x=-1"]), false);
  });
});

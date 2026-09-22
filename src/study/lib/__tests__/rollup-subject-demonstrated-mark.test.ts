import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeDemonstratedMarkPct } from "@/study/lib/demonstrated-mark";

describe("computeDemonstratedMarkPct", () => {
  it("returns importance-weighted average", () => {
    const value = computeDemonstratedMarkPct([
      { masteryPct: 80, importance: 1 },
      { masteryPct: 40, importance: 2 },
    ]);
    assert.equal(value, 53.3);
  });

  it("returns null for empty input", () => {
    assert.equal(computeDemonstratedMarkPct([]), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeMasteryPct,
  masteryFromAttempts,
  priorityBandForMastery,
} from "@/study/lib/mastery";
import { StudyPriorityBand } from "@/generated/prisma/client";

describe("masteryFromAttempts", () => {
  it("computes percentage from attempts", () => {
    assert.equal(masteryFromAttempts(7, 10), 70);
  });
});

describe("computeMasteryPct", () => {
  it("uses confidence when no attempts", () => {
    assert.equal(computeMasteryPct({ questionsAttempted: 0, questionsCorrect: 0, confidencePct: 55 }), 55);
  });

  it("blends early quiz with confidence", () => {
    const value = computeMasteryPct({
      questionsAttempted: 2,
      questionsCorrect: 2,
      confidencePct: 40,
    });
    assert.ok(value > 40 && value < 100);
  });

  it("uses pure performance after enough attempts", () => {
    assert.equal(
      computeMasteryPct({ questionsAttempted: 10, questionsCorrect: 8, confidencePct: 40 }),
      80,
    );
  });
});

describe("priorityBandForMastery", () => {
  it("maps bands", () => {
    assert.equal(priorityBandForMastery(40), StudyPriorityBand.NEEDS_ATTENTION);
    assert.equal(priorityBandForMastery(60), StudyPriorityBand.KEEP_PRACTISING);
    assert.equal(priorityBandForMastery(80), StudyPriorityBand.ON_TRACK);
  });
});

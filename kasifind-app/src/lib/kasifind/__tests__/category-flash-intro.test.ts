import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCinematicMontageSchedule,
  CINEMATIC_MONTAGE_MS,
} from "@/lib/kasifind/category-flash-intro";

test("montage schedule sums to montage duration and accelerates", () => {
  const schedule = buildCinematicMontageSchedule(8);
  assert.equal(schedule.length, 8);
  const total = schedule.reduce((sum, step) => sum + step.durationMs, 0);
  assert.equal(total, CINEMATIC_MONTAGE_MS);
  assert.ok(schedule[0]!.durationMs > schedule[schedule.length - 1]!.durationMs);
});

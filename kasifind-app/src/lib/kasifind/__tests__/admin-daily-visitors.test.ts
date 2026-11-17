import assert from "node:assert/strict";
import { describe, test } from "node:test";

/** Mirrors admin-stats daily unique visitor bucketing (distinct visitorId per SAST day). */
function uniqueVisitorsByDay(
  rows: { visitorId: string; dayKey: string }[]
): Map<string, number> {
  const map = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = map.get(row.dayKey) ?? new Set<string>();
    set.add(row.visitorId);
    map.set(row.dayKey, set);
  }
  return new Map([...map.entries()].map(([day, set]) => [day, set.size]));
}

describe("admin daily unique visitors", () => {
  test("counts distinct visitor ids per day", () => {
    const totals = uniqueVisitorsByDay([
      { dayKey: "2026-11-17", visitorId: "a" },
      { dayKey: "2026-11-17", visitorId: "a" },
      { dayKey: "2026-11-17", visitorId: "b" },
      { dayKey: "2026-11-18", visitorId: "b" },
    ]);
    assert.equal(totals.get("2026-11-17"), 2);
    assert.equal(totals.get("2026-11-18"), 1);
  });
});
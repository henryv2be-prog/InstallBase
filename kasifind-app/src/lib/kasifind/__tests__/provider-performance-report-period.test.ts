import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsCreatedAtFilter,
  resolveProviderReportPeriod,
} from "../provider-performance-report-period";

test("last 7 days uses SAST calendar boundaries", () => {
  const now = new Date("2026-11-08T14:30:00+02:00");
  const result = resolveProviderReportPeriod({ preset: "7d", now });
  assert.ok(!("error" in result));
  assert.equal(result.preset, "7d");
  assert.ok(result.startAt);
  assert.equal(result.startAt!.toISOString(), new Date("2026-11-02T00:00:00+02:00").toISOString());
  const filter = analyticsCreatedAtFilter(result);
  assert.ok(filter.gte);
  assert.equal(filter.lte, now);
});

test("custom range rejects inverted dates", () => {
  const result = resolveProviderReportPeriod({
    preset: "custom",
    customStart: "2026-11-10",
    customEnd: "2026-11-01",
  });
  assert.equal("error" in result && result.error, "range_start_after_end");
});

test("all time has no lower bound", () => {
  const result = resolveProviderReportPeriod({
    preset: "all",
    now: new Date("2026-01-15T10:00:00+02:00"),
  });
  assert.ok(!("error" in result));
  assert.equal(result.startAt, null);
});

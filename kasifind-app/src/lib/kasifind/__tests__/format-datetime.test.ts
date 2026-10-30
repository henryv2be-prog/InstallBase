import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatKfDateTime, kfDateKeyInSast } from "../format-datetime";

describe("format-datetime (SAST)", () => {
  it("formats UTC instant as SAST clock time", () => {
    const formatted = formatKfDateTime("2026-10-30T10:00:00.000Z");
    assert.match(formatted, /12:00/);
  });

  it("buckets by SAST calendar date near midnight UTC", () => {
    assert.equal(kfDateKeyInSast("2026-10-30T22:30:00.000Z"), "2026-10-31");
  });
});

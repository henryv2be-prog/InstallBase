import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseStudyTheme } from "@/study/lib/study-theme";

describe("parseStudyTheme", () => {
  it("accepts dark and light", () => {
    assert.equal(parseStudyTheme("dark"), "dark");
    assert.equal(parseStudyTheme("light"), "light");
  });

  it("rejects unknown values", () => {
    assert.equal(parseStudyTheme("system"), null);
    assert.equal(parseStudyTheme(null), null);
  });
});

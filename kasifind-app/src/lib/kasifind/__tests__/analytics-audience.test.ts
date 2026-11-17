import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  analyticsExcludeAdminWhere,
  withAnalyticsAudience,
} from "@/lib/kasifind/analytics-audience";

describe("analytics audience filters", () => {
  test("withAnalyticsAudience wraps non-empty filters", () => {
    const wrapped = withAnalyticsAudience({ eventType: "LISTING_VIEW" });
    assert.deepEqual(wrapped, {
      AND: [{ eventType: "LISTING_VIEW" }, analyticsExcludeAdminWhere],
    });
  });

  test("withAnalyticsAudience returns exclude-only when empty", () => {
    assert.deepEqual(withAnalyticsAudience(), analyticsExcludeAdminWhere);
  });
});
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildAdminModerationIndexHref,
  buildAdminModerationItemHref,
  buildAdminModerationListQuery,
} from "@/lib/kasifind/admin-moderation-nav";

describe("admin-moderation-nav", () => {
  test("omits pending tab from query", () => {
    assert.equal(buildAdminModerationListQuery({ tab: "pending", page: 2 }), "?page=2");
  });

  test("preserves reports tab and id", () => {
    assert.equal(
      buildAdminModerationItemHref("rep-1", { tab: "reports", page: 2 }),
      "/admin/reports?tab=reports&page=2&id=rep-1"
    );
  });

  test("buildAdminModerationIndexHref for reviews search", () => {
    assert.equal(
      buildAdminModerationIndexHref({ tab: "reviews", q: "great" }),
      "/admin/reports?tab=reviews&q=great"
    );
  });
});
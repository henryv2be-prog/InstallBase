import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildAdminAssistanceDetailHref,
  buildAdminAssistanceIndexHref,
  buildAdminAssistanceListQuery,
} from "@/lib/kasifind/admin-assistance-nav";

describe("admin-assistance-nav", () => {
  test("buildAdminAssistanceListQuery omits default page", () => {
    assert.equal(buildAdminAssistanceListQuery({ status: "PENDING", page: 1 }), "?status=PENDING");
    assert.equal(buildAdminAssistanceListQuery({ page: 2 }), "?page=2");
    assert.equal(buildAdminAssistanceListQuery({}), "");
  });

  test("buildAdminAssistanceDetailHref preserves list params", () => {
    assert.equal(
      buildAdminAssistanceDetailHref("req-1", { status: "IN_PROGRESS", page: 3 }),
      "/admin/listing-assistance/req-1?status=IN_PROGRESS&page=3"
    );
  });

  test("buildAdminAssistanceIndexHref matches list path", () => {
    assert.equal(buildAdminAssistanceIndexHref({ status: "COMPLETED" }), "/admin/listing-assistance?status=COMPLETED");
  });
});
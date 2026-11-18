import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildAdminListingsDetailHref,
  buildAdminListingsIndexHref,
  buildAdminListingsListQuery,
} from "@/lib/kasifind/admin-listings-nav";

describe("admin-listings-nav", () => {
  test("buildAdminListingsListQuery preserves filters", () => {
    assert.equal(
      buildAdminListingsListQuery({ q: "sipho", status: "PUBLISHED", moderation: "PENDING", page: 2 }),
      "?q=sipho&status=PUBLISHED&moderation=PENDING&page=2"
    );
  });

  test("buildAdminListingsDetailHref", () => {
    assert.equal(buildAdminListingsDetailHref("lst-1", { q: "a" }), "/admin/listings/lst-1?q=a");
  });

  test("buildAdminListingsIndexHref", () => {
    assert.equal(buildAdminListingsIndexHref({ moderation: "APPROVED" }), "/admin/listings?moderation=APPROVED");
  });
});
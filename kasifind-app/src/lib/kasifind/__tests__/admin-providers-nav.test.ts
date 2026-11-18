import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildAdminProvidersDetailHref,
  buildAdminProvidersIndexHref,
  buildAdminProvidersListQuery,
} from "@/lib/kasifind/admin-providers-nav";

describe("admin-providers-nav", () => {
  test("buildAdminProvidersListQuery", () => {
    assert.equal(
      buildAdminProvidersListQuery({ q: "test", role: "PROVIDER", suspended: "false", page: 3 }),
      "?q=test&role=PROVIDER&suspended=false&page=3"
    );
  });

  test("buildAdminProvidersDetailHref", () => {
    assert.equal(buildAdminProvidersDetailHref("usr-1", { role: "ADMIN" }), "/admin/users/usr-1?role=ADMIN");
  });

  test("buildAdminProvidersIndexHref", () => {
    assert.equal(buildAdminProvidersIndexHref({}), "/admin/users");
  });
});
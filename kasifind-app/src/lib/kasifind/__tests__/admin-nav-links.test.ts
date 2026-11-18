import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  flattenAdminNavLinks,
  isAdminNavLinkActive,
  KF_ADMIN_MOBILE_PRIMARY,
} from "@/lib/kasifind/admin-nav-links";

describe("admin nav links", () => {
  test("includes Inbox and renamed Providers label", () => {
    const labels = flattenAdminNavLinks().map((l) => l.label);
    assert.ok(labels.includes("Inbox"));
    assert.ok(labels.includes("Providers"));
    assert.ok(!labels.includes("Users"));
    assert.ok(labels.includes("Moderation"));
  });

  test("matches /admin only for Inbox exact routes", () => {
    assert.equal(isAdminNavLinkActive("/admin", { href: "/admin", exact: true }), true);
    assert.equal(isAdminNavLinkActive("/admin/users", { href: "/admin", exact: true }), false);
    assert.equal(
      isAdminNavLinkActive("/admin/listings", { href: "/admin/listings", matchPrefix: "/admin/listings" }),
      true
    );
    assert.equal(
      isAdminNavLinkActive("/admin/listings/abc", { href: "/admin/listings", matchPrefix: "/admin/listings" }),
      true
    );
  });

  test("exposes mobile primary destinations", () => {
    assert.deepEqual(
      KF_ADMIN_MOBILE_PRIMARY.map((l) => l.label),
      ["Inbox", "Assistance", "Listings", "Moderation"]
    );
  });
});
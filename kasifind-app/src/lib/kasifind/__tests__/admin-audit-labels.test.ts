import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  adminAuditActionKind,
  formatAdminAuditActionLabel,
} from "@/lib/kasifind/admin-audit-labels";

describe("admin audit labels", () => {
  test("formats known listing actions", () => {
    assert.equal(formatAdminAuditActionLabel("listing.approved"), "Approved listing");
    assert.equal(adminAuditActionKind("listing.approved"), "listing");
  });

  test("formats report resolution", () => {
    assert.equal(formatAdminAuditActionLabel("report.resolved"), "Resolved user report");
    assert.equal(adminAuditActionKind("report.resolved"), "report");
  });

  test("falls back for unknown actions", () => {
    assert.match(formatAdminAuditActionLabel("custom.thing"), /custom · thing/i);
    assert.equal(adminAuditActionKind("custom.thing"), "other");
  });
});
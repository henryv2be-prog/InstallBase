import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { buildAdminNotificationCopy } from "@/lib/kasifind/admin-notification-deeplinks";
import { PLATFORM_EVENT_REGISTRY, getPlatformEventDefinition } from "@/lib/kasifind/platform-event-registry";
import { flattenAdminNavLinks } from "@/lib/kasifind/admin-nav-links";

describe("admin notifications", () => {
  test("registry lists every spec category", () => {
    const categories = new Set(PLATFORM_EVENT_REGISTRY.map((d) => d.category));
    for (const c of ["user", "provider", "listing", "customer", "admin", "technical"] as const) {
      assert.ok(categories.has(c), c);
    }
    assert.ok(PLATFORM_EVENT_REGISTRY.length >= 30);
  });

  test("unknown event type is rejected", () => {
    assert.equal(getPlatformEventDefinition("not.real"), undefined);
  });

  test("deeplink copy for assistance and moderation", () => {
    const assistance = buildAdminNotificationCopy("provider.listing_assistance_requested", {
      assistanceRequestId: "req1",
    });
    assert.match(assistance.deepLink, /listing-assistance\/req1/);

    const listing = buildAdminNotificationCopy("listing.submitted_for_approval", {
      listingId: "lst1",
      listingName: "Joe's Plumbing",
    });
    assert.match(listing.deepLink, /listings\/lst1/);
    assert.match(listing.title, /awaiting approval/i);
  });

  test("admin nav includes notification centre and settings", () => {
    const labels = flattenAdminNavLinks().map((l) => l.label);
    assert.ok(labels.includes("Centre"));
    assert.ok(labels.includes("Settings"));
  });
});
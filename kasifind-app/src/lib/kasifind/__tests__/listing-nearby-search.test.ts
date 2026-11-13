import assert from "node:assert/strict";
import test from "node:test";
import { buildNearbyListingSearchUrl } from "../listing-nearby-search";
import type { KfDiscoveryState } from "../discovery-state";

test("browse mode when visitor has no selected location", () => {
  const plan = buildNearbyListingSearchUrl("plumbing", {
    query: "",
    radiusKm: 5,
    radiusMode: "auto",
    categorySlug: null,
    location: { mode: "browse", label: "Browsing all areas" },
  });
  assert.equal(plan.mode, "browse");
  assert.match(plan.searchUrl, /browse=1/);
  assert.match(plan.searchUrl, /category=plumbing/);
});

test("geo mode uses persisted manual coordinates", () => {
  const state: KfDiscoveryState = {
    query: "",
    radiusKm: 15,
    radiusMode: "auto",
    categorySlug: null,
    location: { mode: "manual", lat: -26.1, lng: 28.05, label: "Roodepoort" },
  };
  const plan = buildNearbyListingSearchUrl(null, state);
  assert.equal(plan.mode, "geo");
  if (plan.mode === "geo") {
    assert.match(plan.searchUrl, /lat=-26\.1/);
    assert.match(plan.searchUrl, /autoExpand=1/);
    assert.equal(plan.label, "Roodepoort");
  }
});

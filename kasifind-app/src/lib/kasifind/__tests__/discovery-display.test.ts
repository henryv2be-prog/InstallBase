import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDiscoveryResultsSubtitle,
  locationModeLabel,
} from "@/lib/kasifind/discovery-display";

test("locationModeLabel uses friendly mode names", () => {
  assert.equal(locationModeLabel({ mode: "browse", label: "x" }), "Browsing all areas");
  assert.equal(locationModeLabel({ mode: "gps", lat: 1, lng: 2, label: "Near me" }), "Near me");
  assert.equal(
    locationModeLabel({ mode: "manual", lat: 1, lng: 2, label: "Roodepoort" }),
    "Near Roodepoort"
  );
});

test("formatDiscoveryResultsSubtitle explains auto expansion", () => {
  const out = formatDiscoveryResultsSubtitle({
    location: { mode: "gps", lat: -26, lng: 28, label: "Near me" },
    radiusMode: "auto",
    selectedRadiusKm: 5,
    searchMeta: { radiusKm: 15, includesSurroundingAreas: true },
  });
  assert.match(out.primary, /15 km/);
  assert.ok(out.secondary?.includes("Not many businesses"));
});

test("formatDiscoveryResultsSubtitle respects fixed radius copy", () => {
  const out = formatDiscoveryResultsSubtitle({
    location: { mode: "manual", lat: -26, lng: 28, label: "Soweto" },
    radiusMode: "fixed",
    selectedRadiusKm: 30,
    searchMeta: { radiusKm: 30 },
  });
  assert.match(out.primary, /30 km/);
});

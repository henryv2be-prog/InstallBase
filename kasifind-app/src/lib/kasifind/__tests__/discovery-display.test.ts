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
    searchMeta: { radiusKm: 50, includesSurroundingAreas: true },
  });
  assert.match(out.primary, /50 km/);
  assert.ok(out.secondary?.includes("Not many businesses"));
});

test("formatDiscoveryResultsSubtitle for browse does not imply distance sort", () => {
  const out = formatDiscoveryResultsSubtitle({
    location: { mode: "browse", label: "Browsing all areas" },
    radiusMode: "auto",
    selectedRadiusKm: 5,
    searchMeta: { browse: true },
  });
  assert.match(out.primary, /featured first/i);
  assert.equal(out.secondary, null);
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

test("formatDiscoveryResultsSubtitle fixed mode uses selected radius before stale search meta", () => {
  const out = formatDiscoveryResultsSubtitle({
    location: { mode: "gps", lat: -26, lng: 28, label: "Near me" },
    radiusMode: "fixed",
    selectedRadiusKm: 50,
    searchMeta: { radiusKm: 5 },
  });
  assert.match(out.primary, /50 km/);
});

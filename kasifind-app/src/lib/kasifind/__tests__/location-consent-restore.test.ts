import assert from "node:assert/strict";
import test from "node:test";
import { shouldSkipAutoGpsOnHomeLoad } from "../location-consent-restore";

test("never auto-starts GPS on homepage load", () => {
  assert.equal(
    shouldSkipAutoGpsOnHomeLoad("granted", {
      mode: "browse",
      label: "Browsing all areas",
    }),
    true
  );
  assert.equal(
    shouldSkipAutoGpsOnHomeLoad(null, {
      mode: "gps",
      lat: -26.2,
      lng: 28.04,
      label: "Near me",
    }),
    true
  );
  assert.equal(
    shouldSkipAutoGpsOnHomeLoad("dismissed", {
      mode: "manual",
      lat: -26,
      lng: 28,
      label: "Roodepoort",
    }),
    true
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { shouldSkipAutoGpsOnHomeLoad } from "../location-consent-restore";

test("granted consent still auto-GPS when session only has default browse placeholder", () => {
  assert.equal(
    shouldSkipAutoGpsOnHomeLoad("granted", {
      mode: "browse",
      label: "Browsing all areas",
    }),
    false
  );
});

test("dismissed consent skips auto-GPS when user chose nationwide browse", () => {
  assert.equal(
    shouldSkipAutoGpsOnHomeLoad("dismissed", {
      mode: "browse",
      label: "Browsing all areas",
    }),
    true
  );
});

test("manual area choice skips auto-GPS", () => {
  assert.equal(
    shouldSkipAutoGpsOnHomeLoad("granted", {
      mode: "manual",
      lat: -26,
      lng: 28,
      label: "Roodepoort",
    }),
    true
  );
});

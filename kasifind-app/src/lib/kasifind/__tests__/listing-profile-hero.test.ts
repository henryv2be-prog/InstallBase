import assert from "node:assert/strict";
import test from "node:test";
import { fitModeForProfileHero } from "@/lib/kasifind/listing-profile-hero-fit";

test("fitModeForProfileHero prefers cover for wide photos", () => {
  assert.equal(fitModeForProfileHero(1.5), "cover");
  assert.equal(fitModeForProfileHero(1.2), "cover");
});

test("fitModeForProfileHero prefers contain for square logos and portraits", () => {
  assert.equal(fitModeForProfileHero(1), "contain");
  assert.equal(fitModeForProfileHero(0.75), "contain");
});
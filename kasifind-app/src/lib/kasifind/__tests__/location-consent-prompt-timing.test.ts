import assert from "node:assert/strict";
import test from "node:test";
import {
  KF_LOCATION_CONSENT_AFTER_INTRO_MS,
  shouldDeferHomeLocationConsentPrompt,
} from "../location-consent-prompt-timing";

test("location consent waits until intro montage and logo fade complete", () => {
  assert.equal(shouldDeferHomeLocationConsentPrompt("pending"), true);
  assert.equal(shouldDeferHomeLocationConsentPrompt("play"), true);
  assert.equal(shouldDeferHomeLocationConsentPrompt("off"), false);
});

test("post-intro delay is a short beat before fade-in", () => {
  assert.ok(KF_LOCATION_CONSENT_AFTER_INTRO_MS >= 200);
  assert.ok(KF_LOCATION_CONSENT_AFTER_INTRO_MS <= 600);
});

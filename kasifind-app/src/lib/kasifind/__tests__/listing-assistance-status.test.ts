import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVE_LISTING_ASSISTANCE_STATUSES,
  canProviderSubmitListingAssistance,
  isActiveListingAssistanceStatus,
  providerVisibleAssistanceStatusLabel,
} from "@/lib/kasifind/listing-assistance-status";

describe("listing assistance status", () => {
  it("treats PENDING and IN_PROGRESS as active", () => {
    for (const s of ACTIVE_LISTING_ASSISTANCE_STATUSES) {
      assert.equal(isActiveListingAssistanceStatus(s), true);
    }
    assert.equal(isActiveListingAssistanceStatus("COMPLETED"), false);
    assert.equal(isActiveListingAssistanceStatus("DECLINED"), false);
  });

  it("allows a new request only when the latest is closed or missing", () => {
    assert.equal(canProviderSubmitListingAssistance(null), true);
    assert.equal(canProviderSubmitListingAssistance("COMPLETED"), true);
    assert.equal(canProviderSubmitListingAssistance("DECLINED"), true);
    assert.equal(canProviderSubmitListingAssistance("PENDING"), false);
    assert.equal(canProviderSubmitListingAssistance("IN_PROGRESS"), false);
  });

  it("uses provider-friendly labels without admin jargon", () => {
    assert.match(providerVisibleAssistanceStatusLabel("PENDING"), /KasiFind/i);
    assert.equal(providerVisibleAssistanceStatusLabel("COMPLETED"), "Completed");
    assert.equal(providerVisibleAssistanceStatusLabel("DECLINED"), "Not taken forward");
  });
});

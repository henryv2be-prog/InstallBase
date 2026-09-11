import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  needsProfessionalDetails,
  purposeIdsToRoles,
  rolesToPurposeIds,
  getWelcomeMessage,
} from "../platform-roles";

describe("platform-roles", () => {
  it("maps purpose ids to platform roles", () => {
    assert.deepEqual(purposeIdsToRoles(["show_work", "find_work"]), [
      "PROFESSIONAL",
      "SEEKING_WORK",
    ]);
    assert.deepEqual(purposeIdsToRoles(["find_pro"]), ["CUSTOMER"]);
  });

  it("maps roles back to purpose ids", () => {
    assert.deepEqual(
      rolesToPurposeIds(["PROFESSIONAL", "EMPLOYER"]),
      ["show_work", "hire"]
    );
  });

  it("detects when professional signup details are needed", () => {
    assert.equal(needsProfessionalDetails(["CUSTOMER"]), false);
    assert.equal(needsProfessionalDetails(["COMPANY_REP", "EMPLOYER"]), false);
    assert.equal(needsProfessionalDetails(["PROFESSIONAL"]), true);
    assert.equal(needsProfessionalDetails(["SEEKING_WORK"]), true);
  });

  it("builds concise welcome messages", () => {
    assert.match(getWelcomeMessage(["CUSTOMER"]), /discover professionals/i);
    assert.match(getWelcomeMessage(["PROFESSIONAL"]), /sharing the work/i);
    assert.match(getWelcomeMessage([]), /browse the feed/i);
  });
});

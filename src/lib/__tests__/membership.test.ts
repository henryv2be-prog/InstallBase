import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EARLY_BUILDER_MAX_RANK,
  FOUNDING_MEMBER_MAX_RANK,
  buildMemberTierMap,
  feedBoostForMemberTier,
  getMemberTierLabel,
  getMemberTierNote,
  memberTierForSignupRank,
} from "../membership";

describe("membership tiers", () => {
  it("assigns founding member to the first 10 signups", () => {
    assert.equal(memberTierForSignupRank(1), "FOUNDING_MEMBER");
    assert.equal(memberTierForSignupRank(FOUNDING_MEMBER_MAX_RANK), "FOUNDING_MEMBER");
  });

  it("assigns early builder to signups 11 through 50", () => {
    assert.equal(memberTierForSignupRank(FOUNDING_MEMBER_MAX_RANK + 1), "EARLY_BUILDER");
    assert.equal(memberTierForSignupRank(EARLY_BUILDER_MAX_RANK), "EARLY_BUILDER");
  });

  it("returns null after the first 50 signups", () => {
    assert.equal(memberTierForSignupRank(EARLY_BUILDER_MAX_RANK + 1), null);
  });

  it("provides labels and quiet notes", () => {
    assert.equal(getMemberTierLabel("FOUNDING_MEMBER"), "Founding Member");
    assert.equal(getMemberTierLabel("EARLY_BUILDER"), "Early Builder");
    assert.match(getMemberTierNote("FOUNDING_MEMBER")!, /first 10 people/i);
    assert.match(getMemberTierNote("EARLY_BUILDER")!, /first 50 people/i);
  });

  it("gives founding members a slightly larger feed boost", () => {
    assert.ok(feedBoostForMemberTier("FOUNDING_MEMBER") > feedBoostForMemberTier("EARLY_BUILDER"));
    assert.equal(feedBoostForMemberTier(null), 0);
  });

  it("rebuilds tier assignments after signup order changes", () => {
    const userIds = Array.from({ length: 52 }, (_, index) => `user-${index + 1}`);
    const map = buildMemberTierMap(userIds);

    assert.equal(map.get("user-1"), "FOUNDING_MEMBER");
    assert.equal(map.get("user-10"), "FOUNDING_MEMBER");
    assert.equal(map.get("user-11"), "EARLY_BUILDER");
    assert.equal(map.get("user-50"), "EARLY_BUILDER");
    assert.equal(map.get("user-51"), null);
    assert.equal(map.get("user-52"), null);
  });
});

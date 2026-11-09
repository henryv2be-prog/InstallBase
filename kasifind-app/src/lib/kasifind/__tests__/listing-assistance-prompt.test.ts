import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCompletenessGapsSentence,
  getListingCompletenessGaps,
  isListingIncompleteForPublish,
} from "@/lib/kasifind/listing-assistance-prompt";

describe("listing assistance prompt completeness", () => {
  const complete = {
    description: "We build and install steel security gates across Soweto.",
    categoryIds: ["cat1"],
    services: ["gates"],
    workPhotoCount: 2,
    hasProfilePhoto: true,
  };

  it("detects missing pieces before publish", () => {
    assert.equal(isListingIncompleteForPublish(complete), false);
    const gaps = getListingCompletenessGaps({
      ...complete,
      workPhotoCount: 0,
      hasProfilePhoto: false,
      services: [],
    });
    assert.ok(gaps.includes("at least one work photo"));
    assert.ok(gaps.includes("a business photo"));
    assert.ok(gaps.includes("at least one service"));
  });

  it("formats gap lists for dialog copy", () => {
    assert.equal(formatCompletenessGapsSentence(["a category"]), "a category");
    assert.equal(
      formatCompletenessGapsSentence(["a category", "a business photo"]),
      "a category and a business photo"
    );
  });
});

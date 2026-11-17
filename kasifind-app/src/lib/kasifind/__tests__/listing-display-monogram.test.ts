import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { listingDisplayMonogram } from "@/lib/kasifind/listing-display-monogram";

describe("listingDisplayMonogram", () => {
  test("uses first letters of first two words", () => {
    assert.equal(listingDisplayMonogram("Joe's Welding"), "JW");
  });

  test("uses first two characters for single word", () => {
    assert.equal(listingDisplayMonogram("Plumber"), "PL");
  });

  test("returns ? for empty", () => {
    assert.equal(listingDisplayMonogram("   "), "?");
  });
});
import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_CONTACT_CTA_PHRASES,
  assignListingContactCtaPhrases,
  CONTACT_CTA_GROUP_A,
  CONTACT_CTA_GROUP_B,
} from "../contact-cta-phrases";

test("phrase pools include both groups", () => {
  assert.equal(
    ALL_CONTACT_CTA_PHRASES.length,
    CONTACT_CTA_GROUP_A.length + CONTACT_CTA_GROUP_B.length
  );
});

test("assignListingContactCtaPhrases covers every listing id", () => {
  const ids = ["a", "b", "c", "d"];
  const map = assignListingContactCtaPhrases(ids, () => 0.42);
  assert.equal(map.size, ids.length);
  for (const id of ids) {
    assert.ok(map.get(id));
    assert.ok(ALL_CONTACT_CTA_PHRASES.includes(map.get(id)!));
  }
});

test("assignListingContactCtaPhrases avoids consecutive duplicates when possible", () => {
  let n = 0;
  const random = () => {
    n += 1;
    return (n * 0.17) % 1;
  };
  const ids = Array.from({ length: 12 }, (_, i) => `id-${i}`);
  const map = assignListingContactCtaPhrases(ids, random);
  let prev: string | null = null;
  for (const id of ids) {
    const phrase = map.get(id)!;
    if (prev !== null) {
      assert.notEqual(phrase, prev, `consecutive duplicate at ${id}`);
    }
    prev = phrase;
  }
});

test("assignListingContactCtaPhrases is deterministic with fixed random sequence", () => {
  const seq = [0.1, 0.9, 0.3, 0.7, 0.2];
  let i = 0;
  const random = () => seq[i++ % seq.length]!;
  const ids = ["x", "y", "z"];
  const a = assignListingContactCtaPhrases(ids, random);
  i = 0;
  const b = assignListingContactCtaPhrases(ids, random);
  assert.deepEqual([...a.entries()], [...b.entries()]);
});

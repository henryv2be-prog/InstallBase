import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_CONTACT_CTA_PHRASES,
  assignListingContactCtaPhrases,
  assignListingContactCtaPhrasesForHydration,
  contactCtaHydrationSeed,
  createDeterministicContactCtaRandom,
} from "@/lib/kasifind/contact-cta-phrases";
import {
  parseContactCtaSessionMap,
  serializeContactCtaMap,
} from "@/lib/kasifind/contact-cta-session";

test("hydration assignment is identical for same scope and listing ids", () => {
  const ids = ["cmwlun5pu005j4q", "cmvtexru1003f4r", "cmvvf49mg00074r"];
  const scope = "browse|plumbing||0|browse|";
  const a = assignListingContactCtaPhrasesForHydration(ids, scope);
  const b = assignListingContactCtaPhrasesForHydration(ids, scope);
  assert.deepEqual([...a.entries()], [...b.entries()]);
});

test("hydration assignment is stable across separate deterministic RNG instances", () => {
  const ids = ["a", "b", "c", "d"];
  const seed = contactCtaHydrationSeed("test-scope", ids);
  const one = assignListingContactCtaPhrases(ids, createDeterministicContactCtaRandom(seed));
  const two = assignListingContactCtaPhrases(ids, createDeterministicContactCtaRandom(seed));
  assert.deepEqual([...one.entries()], [...two.entries()]);
});

test("random assignment can differ from hydration assignment", () => {
  const ids = Array.from({ length: 8 }, (_, i) => `id-${i}`);
  const scope = "nationwide-browse";
  const hydrated = assignListingContactCtaPhrasesForHydration(ids, scope);
  let differs = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    const shuffled = assignListingContactCtaPhrases(ids, Math.random);
    if ([...hydrated.entries()].some(([id, phrase]) => shuffled.get(id) !== phrase)) {
      differs = true;
      break;
    }
  }
  assert.ok(differs, "expected at least one random shuffle to differ from hydration map");
});

test("session round-trip keeps phrases valid", () => {
  const ids = ["x", "y"];
  const map = assignListingContactCtaPhrases(ids, () => 0.5);
  const raw = serializeContactCtaMap(map);
  const parsed = parseContactCtaSessionMap(raw, ids);
  assert.ok(parsed);
  assert.deepEqual([...parsed!.entries()], [...map.entries()]);
  for (const phrase of parsed!.values()) {
    assert.ok(ALL_CONTACT_CTA_PHRASES.includes(phrase));
  }
});
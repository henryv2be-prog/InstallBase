import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { af } from "@/study/i18n/messages/af";
import { en } from "@/study/i18n/messages/en";

describe("Study Coach locales", () => {
  it("Afrikaans and English share locale codes", () => {
    assert.equal(en.locale, "en");
    assert.equal(af.locale, "af");
    assert.equal(af.nav.home, "Tuis");
    assert.equal(en.nav.home, "Home");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { af } from "@/study/i18n/messages/af";
import { en } from "@/study/i18n/messages/en";
import { localizeSubtopicName, localizeSubjectName } from "@/study/i18n/localize-content";

describe("Study Coach locales", () => {
  it("Afrikaans and English share locale codes", () => {
    assert.equal(en.locale, "en");
    assert.equal(af.locale, "af");
    assert.equal(af.nav.home, "Tuis");
    assert.equal(en.nav.home, "Home");
  });

  it("localizes curriculum labels in Afrikaans", () => {
    assert.equal(localizeSubjectName("af", "mathematics", "Mathematics"), "Wiskunde");
    assert.equal(
      localizeSubtopicName(
        "af",
        "mathematics",
        "algebra",
        "quadratic-equations",
        "Quadratic equations and inequalities",
      ),
      "Kwadratiese vergelikings en ongelykhede",
    );
    assert.equal(
      localizeSubjectName("en", "mathematics", "Mathematics"),
      "Mathematics",
    );
  });
});

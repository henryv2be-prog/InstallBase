import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchesTargeting, parseTargetingRules } from "../targeting";
import { sanitizeAdDestinationUrl, sanitizeAdText } from "../security";
import { mergeAdSettings } from "../config";
import type { TargetingContext } from "../types";
import type { AdvertisingProvider } from "../provider";
import { AD_PLACEMENTS } from "../placements";

describe("targeting", () => {
  it("matches when no rules are set", () => {
    assert.equal(matchesTargeting({}, {}), true);
  });

  it("matches trade/specialty targeting", () => {
    const rules = parseTargetingRules({ trades: ["CCTV", "Security"] });
    const context: TargetingContext = { specialties: ["CCTV", "Networking"] };
    assert.equal(matchesTargeting(rules, context), true);
  });

  it("rejects when trade does not match", () => {
    const rules = parseTargetingRules({ trades: ["Solar"] });
    const context: TargetingContext = { specialties: ["CCTV"] };
    assert.equal(matchesTargeting(rules, context), false);
  });

  it("matches country targeting", () => {
    const rules = parseTargetingRules({ countries: ["South Africa"] });
    assert.equal(matchesTargeting(rules, { country: "South Africa" }), true);
    assert.equal(matchesTargeting(rules, { country: "Germany" }), false);
  });
});

describe("security", () => {
  it("allows safe https URLs", () => {
    assert.equal(sanitizeAdDestinationUrl("https://example.com/page"), "https://example.com/page");
  });

  it("blocks javascript URLs", () => {
    assert.equal(sanitizeAdDestinationUrl("javascript:alert(1)"), null);
  });

  it("allows internal paths when flagged", () => {
    assert.equal(sanitizeAdDestinationUrl("/discover", true), "/discover");
  });

  it("sanitizes ad text", () => {
    assert.equal(sanitizeAdText("<script>bad</script>Hello"), "scriptbad/scriptHello");
  });
});

describe("config", () => {
  it("merges env overrides onto db settings", () => {
    const merged = mergeAdSettings(
      {
        adsEnabled: true,
        sponsoredEnabled: true,
        analyticsEnabled: true,
        maxFeedAds: 3,
        minPostsBetweenAds: 4,
        maxPageAds: 5,
        mobileMaxFeedAds: 2,
        desktopMaxFeedAds: 3,
        defaultPriority: 0,
        provider: "internal",
      },
      { maxFeedAds: 2, adsEnabled: false }
    );
    assert.equal(merged.maxFeedAds, 2);
    assert.equal(merged.adsEnabled, false);
  });
});

describe("provider abstraction", () => {
  it("AdvertisingProvider interface supports pluggable providers", async () => {
    const provider: AdvertisingProvider = {
      name: "mock",
      getAds: async () => [],
    };
    assert.equal(provider.name, "mock");
    const ads = await provider.getAds({ placement: AD_PLACEMENTS.FEED_TOP });
    assert.equal(ads.length, 0);
  });
});

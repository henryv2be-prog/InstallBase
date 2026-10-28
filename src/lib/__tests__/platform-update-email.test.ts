import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPlatformUpdateEmailPayload,
  validatePlatformUpdateInput,
} from "@/lib/platform-update-email";

describe("platform update email", () => {
  it("validates subject and body length", () => {
    const bad = validatePlatformUpdateInput({
      subject: "Hi",
      headline: "Valid headline here",
      bodyText: "Too short",
      ctaLabel: "",
      ctaUrl: "",
    });
    assert.equal(bad.ok, false);

    const prev = process.env.AUTH_URL;
    process.env.AUTH_URL = "https://app.test";
    try {
      const good = validatePlatformUpdateInput({
        subject: "InstallBase update",
        headline: "We improved the feed",
        bodyText: "Videos load faster on older phones. Update the app from your home screen.",
        ctaLabel: "Try it",
        ctaUrl: "/feed/watch",
      });
      assert.equal(good.ok, true);
      if (good.ok) {
        const payload = buildPlatformUpdateEmailPayload(good.content, "Sam");
        assert.match(payload.html, /Platform update/);
        assert.match(payload.html, /We improved the feed/);
        assert.match(payload.text, /Sam/);
        assert.match(good.content.ctaUrl, /feed\/watch/);
      }
    } finally {
      if (prev === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prev;
    }
  });
});

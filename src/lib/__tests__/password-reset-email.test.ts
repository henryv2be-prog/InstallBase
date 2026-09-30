import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPasswordResetUrl } from "@/lib/email";

describe("buildPasswordResetUrl", () => {
  it("uses path token (not query) for email-client compatibility", () => {
    const prev = process.env.AUTH_URL;
    process.env.AUTH_URL = "https://app.example.com";
    try {
      const url = buildPasswordResetUrl("abc123");
      assert.equal(url, "https://app.example.com/reset-password/abc123");
      assert.doesNotMatch(url, /\?token=/);
    } finally {
      if (prev === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prev;
    }
  });
});

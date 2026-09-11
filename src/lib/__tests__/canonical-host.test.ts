import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { getCanonicalHost, shouldRedirectToCanonicalHost } from "../canonical-host";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("canonical host", () => {
  it("reads host from AUTH_URL", () => {
    process.env.AUTH_URL = "https://installbase.up.railway.app";
    assert.equal(getCanonicalHost(), "installbase.up.railway.app");
  });

  it("redirects only explicitly listed legacy hosts", () => {
    process.env.AUTH_URL = "https://installbase.up.railway.app";
    process.env.LEGACY_HOSTS = "base.up.railway.app";
    assert.equal(shouldRedirectToCanonicalHost("base.up.railway.app"), "installbase.up.railway.app");
    assert.equal(shouldRedirectToCanonicalHost("installbase.up.railway.app"), null);
    assert.equal(shouldRedirectToCanonicalHost("other.example.com"), null);
  });

  it("skips localhost", () => {
    process.env.AUTH_URL = "https://installbase.up.railway.app";
    process.env.LEGACY_HOSTS = "base.up.railway.app";
    assert.equal(shouldRedirectToCanonicalHost("localhost"), null);
  });
});

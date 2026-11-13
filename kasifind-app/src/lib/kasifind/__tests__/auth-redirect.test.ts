import test from "node:test";
import assert from "node:assert/strict";
import {
  loginPathWithNext,
  registerPathWithNext,
  sanitizeAuthNextPath,
} from "@/lib/kasifind/auth-redirect";

test("sanitizeAuthNextPath accepts internal account paths", () => {
  assert.equal(sanitizeAuthNextPath("/account/insights", "/"), "/account/insights");
});

test("sanitizeAuthNextPath rejects external and auth loops", () => {
  assert.equal(sanitizeAuthNextPath("https://evil.test", "/"), "/");
  assert.equal(sanitizeAuthNextPath("//evil.test/path", "/"), "/");
  assert.equal(sanitizeAuthNextPath("/login", "/home"), "/home");
  assert.equal(sanitizeAuthNextPath("/register", "/home"), "/home");
});

test("loginPathWithNext encodes next query", () => {
  const path = loginPathWithNext("/account/listing-support");
  assert.match(path, /^\/login\?next=/);
  assert.match(path, /listing-support/);
});

test("registerPathWithNext encodes next query", () => {
  const path = registerPathWithNext("/account/listing");
  assert.match(path, /^\/register\?next=/);
});

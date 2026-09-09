import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { describePushEnableError } from "../push-errors";

describe("describePushEnableError", () => {
  it("maps unauthorized errors to a sign-in hint", () => {
    assert.match(describePushEnableError(new Error("Unauthorized")), /sign in/i);
  });

  it("maps VAPID errors to server configuration guidance", () => {
    assert.match(
      describePushEnableError(new Error("applicationServerKey is not valid")),
      /VAPID/i
    );
  });

  it("falls back to a helpful default", () => {
    assert.match(describePushEnableError(null), /refresh/i);
  });
});

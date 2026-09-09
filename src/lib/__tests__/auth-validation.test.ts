import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validatePassword,
  validateSignupInput,
  validateUsername,
} from "../auth-validation";

describe("auth-validation", () => {
  it("rejects short passwords", () => {
    assert.equal(validatePassword("short"), "Password must be at least 8 characters");
  });

  it("accepts valid passwords", () => {
    assert.equal(validatePassword("long-enough"), null);
  });

  it("rejects invalid usernames", () => {
    assert.match(validateUsername("ab")!, /at least 3/i);
    assert.match(validateUsername("Bad-Name")!, /lowercase/i);
  });

  it("collects signup field errors", () => {
    const errors = validateSignupInput({
      name: "",
      username: "ab",
      email: "not-an-email",
      password: "123",
      city: "",
      country: "",
      experience: "INVALID",
    });

    assert.equal(errors.name, "Full name is required");
    assert.equal(errors.password, "Password must be at least 8 characters");
    assert.equal(errors.email, "Enter a valid email address");
    assert.equal(errors.city, "City is required");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validatePassword,
  validateAccountInput,
  validateProfessionalSignupInput,
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

  it("collects account field errors", () => {
    const errors = validateAccountInput({
      name: "",
      username: "ab",
      email: "not-an-email",
      password: "123",
    });

    assert.equal(errors.name, "Full name is required");
    assert.equal(errors.password, "Password must be at least 8 characters");
    assert.equal(errors.email, "Enter a valid email address");
  });

  it("requires professional fields only when requested", () => {
    const optional = validateProfessionalSignupInput(
      { city: "", country: "", experience: "INVALID" },
      false
    );
    assert.deepEqual(optional, {});

    const required = validateProfessionalSignupInput(
      { city: "", country: "", experience: "INVALID" },
      true
    );
    assert.equal(required.city, "City is required");
    assert.equal(required.experience, "Please choose your experience level");
  });

  it("keeps legacy validateSignupInput professional by default", () => {
    const errors = validateSignupInput({
      name: "",
      username: "ab",
      email: "not-an-email",
      password: "123",
      city: "",
      country: "",
      experience: "INVALID",
    });

    assert.equal(errors.city, "City is required");
  });
});

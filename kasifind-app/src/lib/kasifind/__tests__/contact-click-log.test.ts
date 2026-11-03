import assert from "node:assert/strict";
import test from "node:test";
import {
  formatKfClickIdentity,
  formatKfClickVisitorSuffix,
  formatKfContactClickLabel,
} from "../contact-click-display";

test("formatKfContactClickLabel", () => {
  assert.equal(formatKfContactClickLabel("LISTING_CLICK_WHATSAPP"), "WhatsApp");
  assert.equal(formatKfContactClickLabel("LISTING_CLICK_CALL"), "Phone call");
  assert.equal(formatKfContactClickLabel("LISTING_CLICK_DIRECTIONS"), "Directions");
});

test("formatKfClickVisitorSuffix", () => {
  assert.equal(formatKfClickVisitorSuffix("abcd1234efgh5678"), "abcd1234");
});

test("formatKfClickIdentity registered user", () => {
  const id = formatKfClickIdentity({
    userName: "Sam",
    userEmail: "sam@example.com",
    visitorId: "abcd1234efgh5678",
  });
  assert.equal(id.label, "Sam (sam@example.com)");
  assert.match(id.detail ?? "", /abcd1234/);
});

test("formatKfClickIdentity anonymous", () => {
  const id = formatKfClickIdentity({
    userName: null,
    userEmail: null,
    visitorId: "abcd1234efgh5678",
  });
  assert.match(id.label, /Anonymous/);
  assert.match(id.detail ?? "", /abcd1234efgh5678/);
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWhatsAppUrl,
  defaultEnquiryMessage,
  normalizePhoneForWhatsApp,
} from "@/lib/kasifind/whatsapp";

describe("kasifind whatsapp", () => {
  it("normalizes South African numbers", () => {
    assert.equal(normalizePhoneForWhatsApp("082 123 4567"), "27821234567");
    assert.equal(normalizePhoneForWhatsApp("+27 82 123 4567"), "27821234567");
  });

  it("builds encoded wa.me links", () => {
    const url = buildWhatsAppUrl("0821234567", "Hello & welcome");
    assert.ok(url.startsWith("https://wa.me/27821234567?text="));
    assert.ok(url.includes(encodeURIComponent("Hello & welcome")));
  });

  it("includes KasiFind in default enquiry", () => {
    const msg = defaultEnquiryMessage("Joe's Welding", "steel gates");
    assert.match(msg, /KasiFind/i);
    assert.match(msg, /steel gates/i);
  });
});

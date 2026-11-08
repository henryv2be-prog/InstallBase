import assert from "node:assert/strict";
import test from "node:test";
import {
  buildProviderReportWhatsAppPrefill,
  isValidProviderWhatsAppPhone,
  providerReportWhatsAppUrl,
} from "../provider-performance-report-whatsapp";

test("provider report WhatsApp prefill includes business and period", () => {
  const text = buildProviderReportWhatsAppPrefill("Joe's Welding", "Last 30 days");
  assert.match(text, /Joe's Welding/);
  assert.match(text, /Last 30 days/);
});

test("isValidProviderWhatsAppPhone accepts SA numbers", () => {
  assert.equal(isValidProviderWhatsAppPhone("067 395 5715"), true);
  assert.equal(isValidProviderWhatsAppPhone(""), false);
});

test("providerReportWhatsAppUrl uses wa.me", () => {
  assert.match(
    providerReportWhatsAppUrl("0673955715", "Hello"),
    /^https:\/\/wa\.me\/27673955715\?text=/
  );
});

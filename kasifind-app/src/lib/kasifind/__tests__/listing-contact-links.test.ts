import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildListingTelHref,
  buildListingWhatsAppUrlFromWhatsappField,
  isValidListingPhoneNumber,
  publicListingShowsContactBar,
} from "@/lib/kasifind/listing-contact-links";

describe("listing-contact-links", () => {
  test("validates South African phone lengths", () => {
    assert.equal(isValidListingPhoneNumber("0821234567"), true);
    assert.equal(isValidListingPhoneNumber("123"), false);
    assert.equal(isValidListingPhoneNumber(null), false);
  });

  test("builds WhatsApp URL only from whatsapp field", () => {
    const url = buildListingWhatsAppUrlFromWhatsappField("0821234567", "Joe's Gates", "welding");
    assert.match(url ?? "", /wa\.me\/27821234567/);
    assert.equal(buildListingWhatsAppUrlFromWhatsappField(null, "Joe", "welding"), null);
    assert.equal(buildListingWhatsAppUrlFromWhatsappField("", "Joe", "welding"), null);
  });

  test("builds tel href from phone field", () => {
    assert.equal(buildListingTelHref("082 123 4567"), "tel:0821234567");
    assert.equal(buildListingTelHref(""), null);
  });

  test("shows contact bar when share-only listing id present", () => {
    assert.equal(publicListingShowsContactBar(null, "", null, "lst_1"), true);
    assert.equal(publicListingShowsContactBar(null, "", null, ""), false);
  });
});
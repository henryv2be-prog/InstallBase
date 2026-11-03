import assert from "node:assert/strict";
import test from "node:test";
import { mapNominatimRow, normalizeGeocodeQuery } from "@/lib/kasifind/geocode-utils";

test("normalizeGeocodeQuery trims and collapses spaces", () => {
  assert.equal(normalizeGeocodeQuery("  Roodepoort   Gauteng  "), "Roodepoort Gauteng");
});

test("mapNominatimRow accepts valid SA coordinates", () => {
  const hit = mapNominatimRow({
    display_name: "Roodepoort, Gauteng, South Africa",
    lat: "-26.1625",
    lon: "27.8725",
    place_id: 123,
  });
  assert.ok(hit);
  assert.equal(hit!.latitude, -26.1625);
  assert.equal(hit!.longitude, 27.8725);
});

test("mapNominatimRow rejects places outside SA bounds", () => {
  const hit = mapNominatimRow({
    display_name: "London, UK",
    lat: "51.5074",
    lon: "-0.1278",
    place_id: 1,
  });
  assert.equal(hit, null);
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  diffListingSnapshots,
  parseListingUpsertFormData,
  type ListingUpsertSnapshot,
} from "@/lib/kasifind/listing-upsert-shared";

function baseSnapshot(overrides: Partial<ListingUpsertSnapshot> = {}): ListingUpsertSnapshot {
  return {
    displayName: "Joe's Gates",
    description: "Steel gates and welding in Soweto.",
    phone: "0821234567",
    whatsapp: "0821234567",
    locationLabel: "Orlando",
    latitude: -26.235,
    longitude: 27.908,
    hideExactLocation: true,
    priceHint: null,
    hoursNote: null,
    status: "PUBLISHED",
    moderationStatus: "APPROVED",
    profileImageUrl: null,
    categoryIds: ["cat1"],
    services: ["gates"],
    photoUrls: [],
    ...overrides,
  };
}

describe("parseListingUpsertFormData", () => {
  it("requires validated location coordinates", () => {
    const fd = new FormData();
    fd.set("displayName", "Test Biz");
    fd.set("phone", "0821234567");
    fd.set("locationLabel", "Alex");
    fd.set("latitude", "-26.1");
    fd.set("longitude", "28.0");
    fd.set("locationConfirmed", "false");
    const result = parseListingUpsertFormData(fd);
    assert.equal("error" in result, true);
  });

  it("accepts a minimal valid payload", () => {
    const fd = new FormData();
    fd.set("displayName", "Test Biz");
    fd.set("phone", "0821234567");
    fd.set("locationLabel", "Alex");
    fd.set("latitude", "-26.1076");
    fd.set("longitude", "28.0567");
    fd.set("locationConfirmed", "true");
    fd.set("categoryId", "cat1");
    fd.set("services", "welding");
    const result = parseListingUpsertFormData(fd);
    assert.equal("error" in result, false);
    if ("error" in result) return;
    assert.equal(result.data.displayName, "Test Biz");
    assert.ok(result.data.serviceLines.includes("welding"));
  });
});

describe("diffListingSnapshots", () => {
  it("records scalar and collection changes for audit", () => {
    const before = baseSnapshot();
    const after = baseSnapshot({
      displayName: "Joe's Steel",
      services: ["gates", "burglar bars"],
      photoUrls: ["/uploads/a.jpg"],
    });
    const diffs = diffListingSnapshots(before, after);
    const fields = diffs.map((d) => d.fieldName);
    assert.ok(fields.includes("displayName"));
    assert.ok(fields.includes("services"));
    assert.ok(fields.includes("workPhotos"));
    const nameDiff = diffs.find((d) => d.fieldName === "displayName");
    assert.equal(nameDiff?.previousValue, "Joe's Gates");
    assert.equal(nameDiff?.newValue, "Joe's Steel");
  });

  it("returns no rows when snapshots match", () => {
    const snap = baseSnapshot();
    assert.equal(diffListingSnapshots(snap, { ...snap }).length, 0);
  });
});

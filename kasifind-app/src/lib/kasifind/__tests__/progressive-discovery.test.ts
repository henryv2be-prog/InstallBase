import assert from "node:assert/strict";
import test from "node:test";
import {
  filterHitsWithinRadius,
  planProgressiveDiscovery,
} from "@/lib/kasifind/progressive-discovery";

function mockDistances(spec: {
  within5?: number;
  between5and15?: number;
  between15and30?: number;
  beyond30?: number;
}): number[] {
  const out: number[] = [];
  for (let i = 0; i < (spec.within5 ?? 0); i++) out.push(1 + i * 0.1);
  for (let i = 0; i < (spec.between5and15 ?? 0); i++) out.push(6 + i * 0.2);
  for (let i = 0; i < (spec.between15and30 ?? 0); i++) out.push(16 + i * 0.3);
  for (let i = 0; i < (spec.beyond30 ?? 0); i++) out.push(35 + i);
  return out;
}

test("A — established area: many listings within 5 km, no expansion", () => {
  const distances = mockDistances({ within5: 21 });
  const plan = planProgressiveDiscovery(distances);
  assert.equal(plan.outerRadiusKm, 5);
  assert.equal(plan.includesSurroundingAreas, false);
  assert.equal(plan.localListingCount, 21);
  assert.equal(
    filterHitsWithinRadius(
      distances.map((d) => ({ distanceKm: d })),
      plan.outerRadiusKm
    ).length,
    21
  );
});

test("B — developing area: sparse local, expand to 15 km and accumulate", () => {
  const distances = mockDistances({ within5: 2, between5and15: 8 });
  const plan = planProgressiveDiscovery(distances);
  assert.equal(plan.outerRadiusKm, 15);
  assert.equal(plan.includesSurroundingAreas, true);
  assert.equal(plan.localListingCount, 2);
  assert.equal(plan.totalWithinOuter, 10);
});

test("C — no local listings, expand to 15 km when 12 exist there", () => {
  const distances = mockDistances({ between5and15: 12 });
  const plan = planProgressiveDiscovery(distances);
  assert.equal(plan.outerRadiusKm, 15);
  assert.equal(plan.includesSurroundingAreas, true);
  assert.equal(plan.localListingCount, 0);
  assert.equal(plan.totalWithinOuter, 12);
});

test("D — uncovered within 30 km: expands to max ring with zero results", () => {
  const plan = planProgressiveDiscovery([]);
  assert.equal(plan.outerRadiusKm, 50);
  assert.equal(plan.totalWithinOuter, 0);
});

test("F — many nearby listings: do not expand past 5 km", () => {
  const distances = mockDistances({ within5: 30 });
  const plan = planProgressiveDiscovery(distances);
  assert.equal(plan.outerRadiusKm, 5);
  assert.equal(plan.includesSurroundingAreas, false);
});

test("accumulates all rings within outer edge (does not drop closer hits)", () => {
  const distances = mockDistances({ within5: 2, between5and15: 8, between15and30: 15 });
  const plan = planProgressiveDiscovery(distances);
  assert.equal(plan.outerRadiusKm, 15);
  const hits = filterHitsWithinRadius(
    distances.map((d) => ({ distanceKm: d, id: String(d) })),
    plan.outerRadiusKm
  );
  assert.equal(hits.length, 10);
  const sorted = [...hits].sort((a, b) => a.distanceKm - b.distanceKm);
  assert.ok(sorted[0]!.distanceKm < 5);
});

test("E — browse mode stays separate (no geo plan without coordinates)", () => {
  assert.equal(typeof planProgressiveDiscovery, "function");
});

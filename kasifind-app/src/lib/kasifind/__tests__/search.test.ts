import assert from "node:assert/strict";
import test from "node:test";
import {
  foldSearchText,
  foldedFieldIncludes,
  pluralVariants,
  searchNeedlesForToken,
  tokenizeSearchQuery,
} from "../search-normalize";
import {
  RELEVANCE_TIER,
  compareSearchRanking,
  listingMatchesSearchTokens,
  scoreListingRelevance,
} from "../search-relevance";

const johnsWelding = {
  displayName: "John's Welding",
  description: "On-site welding and fabrication in Roodepoort.",
  locationLabel: "Roodepoort, Gauteng",
  services: [
    { name: "Gates", keywords: "gates" },
    { name: "Burglar bars", keywords: "burglar bars" },
    { name: "Security doors", keywords: "security doors" },
    { name: "General welding", keywords: "general welding" },
  ],
  categories: [{ name: "Welding" }],
};

const gasSupplier = {
  displayName: "Quick Gas Supplies",
  description: "LPG refills and gas bottle delivery.",
  locationLabel: "Soweto",
  services: [{ name: "Gas refills", keywords: "gas refills lpg" }],
  categories: [{ name: "Gas" }],
};

const autoRepair = {
  displayName: "Joe's Car Repairs",
  description: "Brakes, services and panel beating.",
  locationLabel: "Krugersdorp",
  services: [
    { name: "Car repairs", keywords: "car repairs" },
    { name: "Brake repairs", keywords: "brake repairs" },
  ],
  categories: [{ name: "Automotive" }],
};

test("tokenizeSearchQuery trims and splits", () => {
  assert.deepEqual(tokenizeSearchQuery("  burglar   bars  "), ["burglar", "bars"]);
  assert.deepEqual(tokenizeSearchQuery(""), []);
});

test("case-insensitive folded includes", () => {
  assert.equal(foldedFieldIncludes("Burglar Bars", "burglar"), true);
  const aluminiumListing = {
    displayName: "ALUMINIUM Windows SA",
    description: "",
    locationLabel: "",
    services: [{ name: "Aluminium windows", keywords: "aluminium" }],
    categories: [],
  };
  assert.equal(listingMatchesSearchTokens(aluminiumListing, ["aluminum"]), true);
});

test("apostrophe normalisation via variants", () => {
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["johns"]), true);
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["john"]), true);
});

test("plural handling gates / gate", () => {
  assert.ok(pluralVariants("gate").includes("gates"));
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["gate"]), true);
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["gates"]), true);
});

test("service-only matches for John's Welding", () => {
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["burglar", "bars"]), true);
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["security", "doors"]), true);
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["welding"]), true);
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["plumber"]), false);
});

test("business name exact and partial", () => {
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["welding"]), true);
  assert.equal(listingMatchesSearchTokens(gasSupplier, ["quick", "gas"]), true);
  assert.equal(listingMatchesSearchTokens(autoRepair, ["car", "repairs"]), true);
});

test("description and keyword matches", () => {
  assert.equal(listingMatchesSearchTokens(gasSupplier, ["lpg"]), true);
  assert.equal(listingMatchesSearchTokens(autoRepair, ["panel"]), true);
});

test("multi-word AND requires all tokens", () => {
  assert.equal(listingMatchesSearchTokens(johnsWelding, ["burglar", "zzzz"]), false);
});

test("empty query matches any listing", () => {
  assert.equal(listingMatchesSearchTokens(johnsWelding, []), true);
});

test("single-character token can match", () => {
  assert.equal(listingMatchesSearchTokens(gasSupplier, ["g"]), true);
});

test("relevance ranks service above unrelated featured proximity", () => {
  const a = scoreListingRelevance(johnsWelding, ["burglar", "bars"]);
  const b = scoreListingRelevance(gasSupplier, ["burglar", "bars"]);
  assert.ok(a.total > b.total);
  assert.equal(b.allTokensMatched, false);
});

test("relevance tiers prefer service name over business name for service token", () => {
  const withService = scoreListingRelevance(johnsWelding, ["burglar"]);
  assert.ok(withService.total >= RELEVANCE_TIER.serviceName);
});

test("compareSearchRanking: relevance before distance", () => {
  const closerIrrelevant = {
    relevanceTotal: 0,
    distanceKm: 1,
    featured: true,
    reviewCount: 50,
    averageRating: 5,
    displayName: "Z",
  };
  const fartherRelevant = {
    relevanceTotal: RELEVANCE_TIER.serviceName * 2,
    distanceKm: 12,
    featured: false,
    reviewCount: 0,
    averageRating: null,
    displayName: "A",
  };
  assert.ok(
    compareSearchRanking(fartherRelevant, closerIrrelevant, {
      hasQuery: true,
      useDistance: true,
    }) < 0
  );
});

test("compareSearchRanking: distance breaks tie on comparable relevance", () => {
  const near = {
    relevanceTotal: 100,
    distanceKm: 2,
    featured: false,
    reviewCount: 0,
    averageRating: null,
    displayName: "Near",
  };
  const far = {
    relevanceTotal: 100,
    distanceKm: 15,
    featured: true,
    reviewCount: 99,
    averageRating: 5,
    displayName: "Far",
  };
  assert.ok(
    compareSearchRanking(near, far, { hasQuery: true, useDistance: true }) < 0
  );
});

test("compareSearchRanking: nationwide browse features featured before reviews", () => {
  const featured = {
    relevanceTotal: 0,
    distanceKm: Number.NaN,
    featured: true,
    reviewCount: 0,
    averageRating: null,
    displayName: "Featured Co",
  };
  const popular = {
    relevanceTotal: 0,
    distanceKm: Number.NaN,
    featured: false,
    reviewCount: 200,
    averageRating: 5,
    displayName: "Popular Co",
  };
  assert.ok(
    compareSearchRanking(featured, popular, { hasQuery: false, useDistance: false }) < 0
  );
});

test("compareSearchRanking: no query uses distance first", () => {
  const a = {
    relevanceTotal: 0,
    distanceKm: 3,
    featured: false,
    reviewCount: 0,
    averageRating: null,
    displayName: "A",
  };
  const b = {
    relevanceTotal: 0,
    distanceKm: 8,
    featured: true,
    reviewCount: 100,
    averageRating: 5,
    displayName: "B",
  };
  assert.ok(
    compareSearchRanking(a, b, { hasQuery: false, useDistance: true }) < 0
  );
});

test("realistic examples: aluminium windows and repairs", () => {
  const aluminium = {
    displayName: "Clear View Aluminium",
    description: "We install aluminium windows and doors.",
    locationLabel: "Randburg",
    services: [{ name: "Aluminium windows", keywords: "aluminium windows" }],
    categories: [{ name: "Windows" }],
  };
  assert.equal(listingMatchesSearchTokens(aluminium, ["aluminum", "windows"]), true);
  assert.equal(listingMatchesSearchTokens(autoRepair, ["repairs"]), true);
});

test("searchNeedlesForToken includes folded apostrophe-free forms", () => {
  const needles = searchNeedlesForToken("johns");
  assert.ok(needles.some((n) => n.includes("john")));
});

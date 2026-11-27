import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildListingJsonLd } from "@/lib/kasifind/listing-json-ld";
import {
  buildKasiFindRobotsDirectives,
  formatRobotsForTest,
  ROBOTS_ALLOWED_PUBLIC_API_PREFIXES,
} from "@/lib/kasifind/seo-robots-core";
import {
  buildSitemapEntries,
  isListingSitemapEligible,
  type SitemapListingRow,
} from "@/lib/kasifind/seo-sitemap-core";
import {
  getConfiguredSiteOrigin,
  PUBLIC_SITEMAP_STATIC_PATHS,
  resolvePublicSiteOrigin,
  siteOriginFromHeaders,
} from "@/lib/kasifind/site-config";
import type { PublicListingView } from "@/lib/kasifind/listing-public";

const appRoot = path.join(process.cwd(), "src/app");
const origin = "https://kasifind.com";

function listingRow(
  partial: Partial<SitemapListingRow> & Pick<SitemapListingRow, "id">
): SitemapListingRow {
  return {
    id: partial.id,
    updatedAt: partial.updatedAt ?? new Date("2026-01-15T10:00:00.000Z"),
    status: partial.status ?? "PUBLISHED",
    moderationStatus: partial.moderationStatus ?? "APPROVED",
  };
}

function mockListing(overrides: Partial<PublicListingView> = {}): PublicListingView {
  return {
    id: "lst1",
    displayName: "Joe Plumbing",
    description: "Fast local plumbing.",
    phone: "+27123456789",
    whatsapp: null,
    locationLabel: "Soweto, Gauteng",
    hideExactLocation: true,
    map: {
      latitude: -26.2,
      longitude: 27.8,
      approximate: true,
      radiusMeters: 1000,
    },
    priceHint: null,
    hoursNote: null,
    profileImageUrl: "/uploads/a.jpg",
    categories: [{ slug: "plumbing", name: "Plumbing" }],
    services: [{ name: "Leaks" }],
    photos: [],
    reviews: [],
    averageRating: null,
    reviewCount: 0,
    ...overrides,
  };
}

test("resolvePublicSiteOrigin prefers request host over configured Railway domain", () => {
  const prevNext = process.env.NEXT_PUBLIC_SITE_URL;
  const prevAuth = process.env.AUTH_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://kasifind.up.railway.app";
  process.env.AUTH_URL = "https://kasifind.up.railway.app";
  try {
    const headers = new Headers({
      host: "kasifind.com",
      "x-forwarded-host": "kasifind.com",
      "x-forwarded-proto": "https",
    });
    assert.equal(resolvePublicSiteOrigin(headers), "https://kasifind.com");
    assert.equal(siteOriginFromHeaders(headers), "https://kasifind.com");
  } finally {
    if (prevNext === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevNext;
    if (prevAuth === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = prevAuth;
  }
});

test("getConfiguredSiteOrigin prefers NEXT_PUBLIC_SITE_URL", () => {
  const prevNext = process.env.NEXT_PUBLIC_SITE_URL;
  const prevAuth = process.env.AUTH_URL;
  const prevRail = process.env.RAILWAY_PUBLIC_DOMAIN;
  process.env.NEXT_PUBLIC_SITE_URL = "https://kasifind.com/";
  process.env.AUTH_URL = "https://other.example";
  process.env.RAILWAY_PUBLIC_DOMAIN = "old.up.railway.app";
  try {
    assert.equal(getConfiguredSiteOrigin(), "https://kasifind.com");
  } finally {
    if (prevNext === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevNext;
    if (prevAuth === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = prevAuth;
    if (prevRail === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN;
    else process.env.RAILWAY_PUBLIC_DOMAIN = prevRail;
  }
});

test("isListingSitemapEligible accepts published+approved only", () => {
  assert.equal(isListingSitemapEligible({ status: "PUBLISHED", moderationStatus: "APPROVED" }), true);
  assert.equal(isListingSitemapEligible({ status: "DRAFT", moderationStatus: "APPROVED" }), false);
  assert.equal(isListingSitemapEligible({ status: "PUBLISHED", moderationStatus: "PENDING" }), false);
  assert.equal(isListingSitemapEligible({ status: "PUBLISHED", moderationStatus: "REJECTED" }), false);
  assert.equal(isListingSitemapEligible({ status: "DISABLED", moderationStatus: "APPROVED" }), false);
});

test("buildSitemapEntries includes static pages and eligible listings", () => {
  const entries = buildSitemapEntries(origin, [
    listingRow({ id: "a" }),
    listingRow({ id: "b", status: "DRAFT", moderationStatus: "APPROVED" }),
    listingRow({ id: "c", status: "PUBLISHED", moderationStatus: "REJECTED" }),
  ]);

  const urls = entries.map((e) => e.url);
  for (const p of PUBLIC_SITEMAP_STATIC_PATHS) {
    const expected = p === "/" ? `${origin}/` : `${origin}${p}`;
    assert.ok(urls.includes(expected), `missing static ${expected}`);
  }
  assert.ok(urls.includes(`${origin}/providers/a`));
  assert.ok(!urls.includes(`${origin}/providers/b`));
  assert.ok(!urls.includes(`${origin}/providers/c`));
});

test("sitemap listing lastModified follows updatedAt", () => {
  const older = new Date("2026-02-01T00:00:00.000Z");
  const newer = new Date("2026-06-01T00:00:00.000Z");
  const first = buildSitemapEntries(origin, [listingRow({ id: "x", updatedAt: older })]);
  const second = buildSitemapEntries(origin, [listingRow({ id: "x", updatedAt: newer })]);
  const url = `${origin}/providers/x`;
  const e1 = first.find((e) => e.url === url);
  const e2 = second.find((e) => e.url === url);
  assert.equal(new Date(e1!.lastModified!).getTime(), older.getTime());
  assert.equal(new Date(e2!.lastModified!).getTime(), newer.getTime());
});

test("robots.txt allows public paths and blocks private areas", () => {
  const text = formatRobotsForTest(buildKasiFindRobotsDirectives(origin));
  assert.match(text, /Allow: \//);
  for (const path of ROBOTS_ALLOWED_PUBLIC_API_PREFIXES) {
    assert.match(text, new RegExp(`Allow: ${path.replace("/", "\\/")}`));
  }
  assert.match(text, /Disallow: \/admin/);
  assert.match(text, /Disallow: \/account/);
  assert.match(text, /Disallow: \/login/);
  assert.match(text, /Disallow: \/register/);
  assert.match(text, /Disallow: \/api\//);
  assert.match(text, /Sitemap: https:\/\/kasifind\.com\/sitemap\.xml/);
});

test("sitemap and robots route files exist", () => {
  assert.ok(fs.existsSync(path.join(appRoot, "sitemap.ts")));
  assert.ok(fs.existsSync(path.join(appRoot, "robots.ts")));
});

test("JSON-LD uses public fields and omits exact geo when location hidden", () => {
  const data = buildListingJsonLd({
    listing: mockListing(),
    canonicalUrl: `${origin}/providers/lst1`,
    siteOrigin: origin,
  });
  assert.equal(data.name, "Joe Plumbing");
  assert.equal(data["@type"], "Plumber");
  assert.equal(data.url, `${origin}/providers/lst1`);
  assert.equal(data.telephone, "+27123456789");
  assert.ok(data.areaServed);
  assert.equal(data.geo, undefined);
  assert.match(JSON.stringify(data), /\/uploads\/a\.jpg/);
});

test("JSON-LD includes geo only when exact location is public", () => {
  const data = buildListingJsonLd({
    listing: mockListing({
      hideExactLocation: false,
      map: { latitude: -26.1, longitude: 28.0, approximate: false, radiusMeters: null },
    }),
    canonicalUrl: `${origin}/providers/lst1`,
    siteOrigin: origin,
  });
  assert.deepEqual(data.geo, {
    "@type": "GeoCoordinates",
    latitude: -26.1,
    longitude: 28.0,
  });
});

test("private routes export noindex metadata", () => {
  const adminLayout = fs.readFileSync(path.join(appRoot, "admin/layout.tsx"), "utf8");
  const accountLayout = fs.readFileSync(path.join(appRoot, "account/layout.tsx"), "utf8");
  const login = fs.readFileSync(path.join(appRoot, "login/page.tsx"), "utf8");
  const register = fs.readFileSync(path.join(appRoot, "register/page.tsx"), "utf8");
  const provider = fs.readFileSync(path.join(appRoot, "providers/[id]/page.tsx"), "utf8");

  for (const text of [adminLayout, accountLayout, login, register]) {
    assert.match(text, /KF_PRIVATE_ROUTE_ROBOTS/);
    assert.match(text, /robots:/);
  }
  assert.doesNotMatch(provider, /KF_PRIVATE_ROUTE_ROBOTS/);
});

test("root layout sets metadataBase from public site origin", () => {
  const layout = fs.readFileSync(path.join(appRoot, "layout.tsx"), "utf8");
  assert.match(layout, /metadataBase/);
  assert.match(layout, /resolvePublicSiteOrigin/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /openGraph/);
});

test("homepage metadata includes absolute canonical", () => {
  const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
  assert.match(home, /generateMetadata/);
  assert.match(home, /buildCanonicalAlternates\("\/",/);
  assert.match(home, /KasiFind — Find local\. Support local\. Grow local\./);
  assert.doesNotMatch(home, /providerListCta/);
});

test("homepage server-seeds nationwide browse for crawlers", () => {
  const home = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
  assert.match(home, /searchProvidersBrowse/);
  assert.match(home, /initialBrowseResults/);
  assert.match(home, /KfHomeBrowseSeoIndex/);
  assert.match(home, /buildHomeBrowseItemListJsonLd/);
});

test("list-your-business page is public SEO with canonical", () => {
  const page = fs.readFileSync(
    path.join(appRoot, "list-your-business", "page.tsx"),
    "utf8"
  );
  assert.match(page, /buildCanonicalAlternates\("\/list-your-business"/);
  assert.doesNotMatch(page, /KF_PRIVATE_ROUTE_ROBOTS/);
  assert.match(page, /listYourBusinessCtaHref/);
});

test("sitemap includes list-your-business", () => {
  assert.ok(PUBLIC_SITEMAP_STATIC_PATHS.includes("/list-your-business"));
});

test("homepage progressive grid keeps full browse seed for SEO", () => {
  const homeClient = fs.readFileSync(
    path.join(process.cwd(), "src/components/kasifind/kf-home-client.tsx"),
    "utf8"
  );
  assert.match(homeClient, /initialHomeBrowseVisibleCount/);
  assert.match(homeClient, /visibleResults/);
  const page = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
  assert.doesNotMatch(page, /initialHomeBrowseVisibleCount/);
  assert.match(page, /KfHomeBrowseSeoIndex results=\{initialBrowseResults\}/);
});
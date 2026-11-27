import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { categoryPublicPath } from "@/lib/kasifind/category-public-path";
import { locationPublicPath } from "@/lib/kasifind/location-public-path";
import { listingPublicPath } from "@/lib/kasifind/share-provider-listing";
import {
  buildCanonicalUrl,
  KASIFIND_PRODUCTION_ORIGIN,
} from "@/lib/kasifind/seo-canonical";
import { buildSitemapEntries } from "@/lib/kasifind/seo-sitemap-core";
import { PUBLIC_SITEMAP_STATIC_PATHS } from "@/lib/kasifind/site-config";

const appRoot = path.join(process.cwd(), "src/app");
const origin = KASIFIND_PRODUCTION_ORIGIN;

test("buildCanonicalUrl prefers kasifind.com request host", () => {
  const headers = new Headers({
    host: "kasifind.com",
    "x-forwarded-host": "kasifind.com",
    "x-forwarded-proto": "https",
  });
  assert.equal(buildCanonicalUrl("/", headers), "https://kasifind.com/");
  assert.equal(
    buildCanonicalUrl("/categories/aluminium-windows", headers),
    "https://kasifind.com/categories/aluminium-windows"
  );
});

test("buildCanonicalUrl falls back to production origin without headers", () => {
  assert.equal(
    buildCanonicalUrl(categoryPublicPath("plumbing")),
    `${origin}/categories/plumbing`
  );
  assert.equal(
    buildCanonicalUrl(locationPublicPath("johannesburg")),
    `${origin}/locations/johannesburg`
  );
  assert.equal(
    buildCanonicalUrl(listingPublicPath("lst_sample")),
    `${origin}/providers/lst_sample`
  );
});

test("sitemap URLs align with canonical paths", () => {
  const entries = buildSitemapEntries(
    origin,
    [{ id: "lst1", updatedAt: new Date("2026-01-01"), status: "PUBLISHED", moderationStatus: "APPROVED" }],
    [{ slug: "plumbing", createdAt: new Date("2026-01-01") }],
    [{ slug: "johannesburg" }]
  );
  const urls = new Set(entries.map((e) => e.url));
  for (const p of PUBLIC_SITEMAP_STATIC_PATHS) {
    const expected = buildCanonicalUrl(p);
    assert.ok(urls.has(expected), `sitemap missing ${expected}`);
  }
  assert.ok(urls.has(buildCanonicalUrl(categoryPublicPath("plumbing"))));
  assert.ok(urls.has(buildCanonicalUrl(locationPublicPath("johannesburg"))));
  assert.ok(urls.has(buildCanonicalUrl(listingPublicPath("lst1"))));
});

const PUBLIC_ROUTE_CANONICAL_CHECKS: { file: string; pathContains: string; expectPath: string }[] = [
  { file: "page.tsx", pathContains: "buildCanonicalUrl(\"/\"", expectPath: "/" },
  {
    file: "categories/[slug]/page.tsx",
    pathContains: "buildCanonicalAlternates",
    expectPath: "/categories/",
  },
  {
    file: "locations/[slug]/page.tsx",
    pathContains: "buildCanonicalAlternates",
    expectPath: "/locations/",
  },
  {
    file: "providers/[id]/page.tsx",
    pathContains: "buildCanonicalAlternates",
    expectPath: "listingPublicPath",
  },
];

test("public landing pages declare absolute canonical helpers", () => {
  for (const check of PUBLIC_ROUTE_CANONICAL_CHECKS) {
    const text = fs.readFileSync(path.join(appRoot, check.file), "utf8");
    assert.match(text, new RegExp(check.pathContains.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("root layout does not set homepage openGraph url on all routes", () => {
  const layout = fs.readFileSync(path.join(appRoot, "layout.tsx"), "utf8");
  assert.doesNotMatch(layout, /openGraph:[\s\S]*url:\s*["']\/["']/);
  assert.match(layout, /metadataBase:\s*new URL\(siteOrigin\)/);
});

test("next config blocks streaming metadata for search crawlers", () => {
  const config = fs.readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");
  assert.match(config, /htmlLimitedBots/);
  assert.match(config, /Googlebot/);
});
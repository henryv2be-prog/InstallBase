import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { locationPublicPath } from "@/lib/kasifind/location-public-path";
import { getSeoLocationHub, SEO_LOCATION_HUBS } from "@/lib/kasifind/location-seo-hubs";
import { buildPublishedListingWhere } from "@/lib/kasifind/search-query";
import { buildSitemapEntries } from "@/lib/kasifind/seo-sitemap-core";
import { PUBLIC_SITEMAP_STATIC_PATHS } from "@/lib/kasifind/site-config";

const appRoot = path.join(process.cwd(), "src/app");
const origin = "https://kasifind.com";

test("location hub slugs resolve and paths are stable", () => {
  const hub = getSeoLocationHub("soweto");
  assert.ok(hub);
  assert.equal(locationPublicPath("soweto"), "/locations/soweto");
});

test("buildPublishedListingWhere location filter only targets locationLabel", () => {
  const where = buildPublishedListingWhere({
    query: "",
    locationLabelContains: "Soweto",
  });
  const json = JSON.stringify(where);
  assert.match(json, /locationLabel/);
  assert.match(json, /Soweto/i);
});

test("sitemap includes locations index and hub URLs", () => {
  const hubs = SEO_LOCATION_HUBS.slice(0, 3).map((h) => ({ slug: h.slug }));
  const entries = buildSitemapEntries(origin, [], [], hubs);
  const urls = entries.map((e) => e.url);
  assert.ok(PUBLIC_SITEMAP_STATIC_PATHS.includes("/locations"));
  assert.ok(urls.includes(`${origin}/locations`));
  assert.ok(urls.includes(`${origin}/locations/soweto`));
});

test("location browse route files exist", () => {
  assert.ok(fs.existsSync(path.join(appRoot, "locations/page.tsx")));
  assert.ok(fs.existsSync(path.join(appRoot, "locations/[slug]/page.tsx")));
});
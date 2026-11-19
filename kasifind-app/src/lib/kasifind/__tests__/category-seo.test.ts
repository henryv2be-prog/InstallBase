import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { categoryBrowseDescription, categoryPublicPath } from "@/lib/kasifind/category-public-path";
import { buildSitemapEntries } from "@/lib/kasifind/seo-sitemap-core";
import { PUBLIC_SITEMAP_STATIC_PATHS } from "@/lib/kasifind/site-config";

const appRoot = path.join(process.cwd(), "src/app");
const origin = "https://kasifind.com";

test("categoryPublicPath builds crawlable URL segment", () => {
  assert.equal(categoryPublicPath("plumbing"), "/categories/plumbing");
});

test("buildSitemapEntries includes category hub and slug URLs", () => {
  const entries = buildSitemapEntries(
    origin,
    [],
    [{ slug: "plumbing", createdAt: new Date("2026-03-01T00:00:00.000Z") }]
  );
  const urls = entries.map((e) => e.url);
  assert.ok(urls.includes(`${origin}/categories`));
  assert.ok(PUBLIC_SITEMAP_STATIC_PATHS.includes("/categories"));
  assert.ok(urls.includes(`${origin}/categories/plumbing`));
});

test("category browse pages exist with metadata helpers", () => {
  assert.ok(fs.existsSync(path.join(appRoot, "categories/page.tsx")));
  assert.ok(fs.existsSync(path.join(appRoot, "categories/[slug]/page.tsx")));
  assert.match(categoryBrowseDescription("Plumbing"), /Plumbing/i);
  assert.match(categoryBrowseDescription("Plumbing"), /South Africa/);
});
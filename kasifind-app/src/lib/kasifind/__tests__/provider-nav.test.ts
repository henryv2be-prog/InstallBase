import assert from "node:assert/strict";
import test from "node:test";
import { listYourBusinessCtaHref, resolveProviderNavLink } from "@/lib/kasifind/provider-nav";

test("resolveProviderNavLink — visitor", () => {
  assert.deepEqual(resolveProviderNavLink({ signedIn: false, hasListing: false }), {
    href: "/list-your-business",
    label: "List Your Business",
  });
});

test("resolveProviderNavLink — signed in without listing", () => {
  assert.deepEqual(resolveProviderNavLink({ signedIn: true, hasListing: false }), {
    href: "/list-your-business",
    label: "List Your Business",
  });
});

test("resolveProviderNavLink — signed in with listing", () => {
  assert.deepEqual(resolveProviderNavLink({ signedIn: true, hasListing: true }), {
    href: "/account",
    label: "Business Hub",
  });
});

test("listYourBusinessCtaHref", () => {
  assert.equal(listYourBusinessCtaHref(false), "/register?next=%2Faccount%2Flisting");
  assert.equal(listYourBusinessCtaHref(true), "/account/listing");
});
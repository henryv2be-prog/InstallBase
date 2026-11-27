import type { Metadata } from "next";
import { getConfiguredSiteOrigin, resolvePublicSiteOrigin } from "@/lib/kasifind/site-config";

/** Production host used when request/env origin is unavailable (tests, fallbacks). */
export const KASIFIND_PRODUCTION_ORIGIN = "https://kasifind.com";

export function resolveCanonicalSiteOrigin(headerStore?: Headers | null): string {
  const fromRequestOrEnv =
    resolvePublicSiteOrigin(headerStore ?? null) ?? getConfiguredSiteOrigin();
  return (fromRequestOrEnv ?? KASIFIND_PRODUCTION_ORIGIN).replace(/\/$/, "");
}

/** Absolute canonical URL for a public path (always includes https origin). */
export function buildCanonicalUrl(pathname: string, headerStore?: Headers | null): string {
  const origin = resolveCanonicalSiteOrigin(headerStore);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") return `${origin}/`;
  return `${origin}${path}`;
}

export function buildCanonicalAlternates(
  pathname: string,
  headerStore?: Headers | null
): NonNullable<Metadata["alternates"]> {
  return { canonical: buildCanonicalUrl(pathname, headerStore) };
}

export function buildPublicOpenGraph(input: {
  title: string;
  description: string;
  canonical: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    title: input.title,
    description: input.description,
    url: input.canonical,
    type: "website",
    locale: "en_ZA",
  };
}

export function buildPublicTwitter(
  title: string,
  description: string
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
  };
}
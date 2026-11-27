import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { locationPublicPath } from "@/lib/kasifind/location-public-path";
import { SEO_LOCATION_HUBS, type SeoLocationHub } from "@/lib/kasifind/location-seo-hubs";
import {
  buildCanonicalAlternates,
  buildCanonicalUrl,
  buildPublicOpenGraph,
  buildPublicTwitter,
} from "@/lib/kasifind/seo-canonical";

export const dynamic = "force-dynamic";

const LOCATIONS_TITLE = "Browse by area";
const LOCATIONS_DESCRIPTION =
  "Find local businesses by area on KasiFind — explore published listings in major South African cities and towns.";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const canonical = buildCanonicalUrl("/locations", headerStore);
  const ogTitle = `${LOCATIONS_TITLE} | KasiFind`;
  return {
    title: LOCATIONS_TITLE,
    description: LOCATIONS_DESCRIPTION,
    alternates: buildCanonicalAlternates("/locations", headerStore),
    openGraph: buildPublicOpenGraph({
      title: ogTitle,
      description: LOCATIONS_DESCRIPTION,
      canonical,
    }),
    twitter: buildPublicTwitter(ogTitle, LOCATIONS_DESCRIPTION),
  };
}

export default function LocationsIndexPage() {
  const byProvince = new Map<string, SeoLocationHub[]>();
  for (const hub of SEO_LOCATION_HUBS) {
    const list = byProvince.get(hub.province) ?? [];
    list.push(hub);
    byProvince.set(hub.province, list);
  }

  const provinces = [...byProvince.keys()].sort();

  return (
    <div className="kf-animate-in">
      <h1 className="kf-hero-title text-2xl sm:text-3xl">Browse by area</h1>
      <p className="kf-section-sub mt-2">
        These pages list published businesses whose public area matches the place name on their listing.
        For live distance search, use{" "}
        <Link href="/" className="kf-link underline">
          home
        </Link>{" "}
        with Near me or a chosen location.
      </p>

      <div className="mt-6 space-y-6">
        {provinces.map((province) => (
          <section key={province} aria-labelledby={`loc-province-${province.replace(/\s+/g, "-")}`}>
            <h2
              id={`loc-province-${province.replace(/\s+/g, "-")}`}
              className="text-sm font-bold uppercase tracking-wide text-[var(--kf-muted)]"
            >
              {province}
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {(byProvince.get(province) ?? []).map((hub) => (
                <li key={hub.slug}>
                  <Link
                    href={locationPublicPath(hub.slug)}
                    className="kf-card flex items-center gap-2 px-4 py-3 hover:border-[var(--kf-forest)]"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
                    <span className="font-medium text-[var(--kf-charcoal)]">{hub.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
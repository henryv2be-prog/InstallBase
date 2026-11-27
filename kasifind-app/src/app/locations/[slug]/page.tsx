import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { KfCategoryBrowseList } from "@/components/kasifind/kf-category-browse-list";
import { locationPublicPath } from "@/lib/kasifind/location-public-path";
import {
  getSeoLocationHub,
  locationHubBrowseDescription,
} from "@/lib/kasifind/location-seo-hubs";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { searchProvidersBrowseByLocationLabel } from "@/lib/kasifind/search";
import {
  buildCanonicalAlternates,
  buildCanonicalUrl,
  buildPublicOpenGraph,
  buildPublicTwitter,
} from "@/lib/kasifind/seo-canonical";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getSeoLocationHub(slug);
  if (!hub) {
    return { title: "Area not found" };
  }
  const headerStore = await headers();
  const path = locationPublicPath(slug);
  const canonical = buildCanonicalUrl(path, headerStore);
  const title = `${hub.name} local businesses | KasiFind`;
  const description = locationHubBrowseDescription(hub);
  return {
    title: `${hub.name} area`,
    description,
    alternates: buildCanonicalAlternates(path, headerStore),
    openGraph: buildPublicOpenGraph({ title, description, canonical }),
    twitter: buildPublicTwitter(title, description),
  };
}

export default async function LocationBrowsePage({ params }: Props) {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card p-6">
        <p>KasiFind is not configured on this server.</p>
      </div>
    );
  }

  const { slug } = await params;
  const hub = getSeoLocationHub(slug);
  if (!hub) notFound();

  const { results } = await searchProvidersBrowseByLocationLabel({
    locationLabelContains: hub.locationLabelMatch,
  });

  return (
    <div className="kf-animate-in">
      <nav className="text-sm">
        <Link href="/locations" className="kf-link underline">
          Areas
        </Link>
      </nav>

      <header className="mt-3 flex items-start gap-3">
        <MapPin className="mt-1 h-6 w-6 shrink-0 text-[var(--kf-forest)]" aria-hidden />
        <div>
          <h1 className="kf-hero-title text-2xl sm:text-3xl">{hub.name}</h1>
          <p className="kf-section-sub mt-1">{locationHubBrowseDescription(hub)}</p>
          <p className="mt-1 text-xs text-[var(--kf-muted)]">{hub.province}</p>
        </div>
      </header>

      <p className="mt-4 text-sm text-[var(--kf-muted)]">
        Listings shown here have a public area label mentioning &ldquo;{hub.locationLabelMatch}&rdquo;.
        Exact pins stay private when providers choose to hide them.
      </p>

      <p className="mt-2 text-sm text-[var(--kf-muted)]">
        {results.length > 0
          ? `Showing ${results.length} published listing${results.length === 1 ? "" : "s"} (featured first, then relevance).`
          : "No published listings match this area label yet."}
      </p>

      <KfCategoryBrowseList listings={results} categoryName={`${hub.name} area`} />

      <p className="mt-8 text-sm text-[var(--kf-muted)]">
        <Link href="/" className="kf-link underline">
          Search from home
        </Link>{" "}
        for distance-based results — this page does not change your live search filters.
      </p>
    </div>
  );
}
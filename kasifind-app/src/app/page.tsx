import type { Metadata } from "next";
import { headers } from "next/headers";
import { KfHomeBrowseSeoIndex } from "@/components/kasifind/kf-home-browse-seo-index";
import { KfHomeClient } from "@/components/kasifind/kf-home-client";
import { KfListingJsonLd } from "@/components/kasifind/kf-listing-json-ld";
import type { KfSearchResult } from "@/components/kasifind/types";
import { BROWSE_LISTING_LIMIT } from "@/lib/kasifind/discovery-config";
import { buildHomeBrowseItemListJsonLd } from "@/lib/kasifind/home-browse-json-ld";
import { getListingForUser } from "@/lib/kasifind/provider-listing";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { searchProvidersBrowse } from "@/lib/kasifind/search";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { resolvePublicSiteOrigin } from "@/lib/kasifind/site-config";

export const dynamic = "force-dynamic";

const homeTitle = "KasiFind — Find local. Support local. Grow local.";
const homeDescription =
  "Discover trusted local services, skilled artisans and businesses across South Africa.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
    type: "website",
    locale: "en_ZA",
  },
};

export default async function KasiFindHomePage() {
  const dbConfigured = isKasiFindDbConfigured();

  let providerListCta: {
    href: string;
    label: string;
    hint: string | null;
    listingId?: string | null;
    displayName?: string | null;
    shareEnabled?: boolean;
  } | null = null;
  let initialBrowseResults: KfSearchResult[] = [];
  if (dbConfigured) {
    const user = await getKasiFindSessionUser().catch(() => null);
    if (user) {
      const listing = await getListingForUser(user.id).catch(() => null);
      providerListCta = {
        href: "/account",
        label: listing ? "My business hub" : "Create your free listing",
        hint: listing ? null : "Set up in minutes — no company registration required.",
        listingId: listing?.id ?? null,
        displayName: listing?.displayName ?? null,
        shareEnabled: listing
          ? listing.status === "PUBLISHED" && listing.moderationStatus === "APPROVED"
          : false,
      };
    } else {
      providerListCta = {
        href: "/account/listing",
        label: "List your business — it's free",
        hint: "Reach neighbours searching for your trade on KasiFind.",
      };
    }

    try {
      const browse = await searchProvidersBrowse({ query: "", limit: BROWSE_LISTING_LIMIT });
      initialBrowseResults = browse.results;
    } catch {
      initialBrowseResults = [];
    }
  }

  const siteOrigin = resolvePublicSiteOrigin(await headers());
  const browseJsonLd =
    siteOrigin && initialBrowseResults.length > 0
      ? buildHomeBrowseItemListJsonLd(siteOrigin, initialBrowseResults)
      : null;

  return (
    <>
      {browseJsonLd ? <KfListingJsonLd data={browseJsonLd} /> : null}
      <KfHomeClient
        dbConfigured={dbConfigured}
        providerListCta={providerListCta}
        initialBrowseResults={initialBrowseResults}
      />
      <KfHomeBrowseSeoIndex results={initialBrowseResults} />
    </>
  );
}

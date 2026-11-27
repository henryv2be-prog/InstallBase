import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { resolveProviderListingPage } from "@/lib/kasifind/listing-public";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { pickDirectionsUrl } from "@/lib/kasifind/navigation-urls";
import { publicAssetUrl, siteOriginFromHeaders } from "@/lib/kasifind/public-asset-url";
import {
  buildCanonicalAlternates,
  buildCanonicalUrl,
  buildPublicTwitter,
} from "@/lib/kasifind/seo-canonical";
import { publicListingShowsContactBar } from "@/lib/kasifind/listing-contact-links";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";
import { KfListingProfileHero } from "@/components/kasifind/kf-listing-profile-hero";
import { KfListingDetailTabs } from "@/components/kasifind/kf-listing-detail-tabs";
import { KfReportForm } from "@/components/kasifind/kf-report-form";
import { KfTrackListingView } from "@/components/kasifind/kf-track-listing-view";
import { KfListingPageScrollTop } from "@/components/kasifind/kf-listing-page-scroll-top";
import { KfProviderLocationMap } from "@/components/kasifind/kf-provider-location-map";
import { KfListingRatingDisplay } from "@/components/kasifind/kf-listing-rating-display";
import { KfListingNearbySection } from "@/components/kasifind/kf-listing-nearby-section";
import { KfListingCategoryStrip } from "@/components/kasifind/kf-listing-category-strip";
import { listKfCategories } from "@/lib/kasifind/categories";
import { buildListingJsonLd } from "@/lib/kasifind/listing-json-ld";
import { buildListingOgDescription, pickListingOpenGraphImagePath } from "@/lib/kasifind/listing-og";
import { resolvePublicSiteOrigin } from "@/lib/kasifind/site-config";
import { listingPublicPath, listingPublicUrl } from "@/lib/kasifind/share-provider-listing";
import { KfListingJsonLd } from "@/components/kasifind/kf-listing-json-ld";
import { KfListingPersistentContactBar } from "@/components/kasifind/kf-listing-persistent-contact-bar";
import { KfListingLcpPreload } from "@/components/kasifind/kf-listing-lcp-preload";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isKasiFindDbConfigured()) {
    return { title: "KasiFind" };
  }
  const { id } = await params;
  const resolved = await resolveProviderListingPage(id, null);
  if (!resolved) {
    return { title: "Listing not found" };
  }
  const { listing } = resolved;
  const headerStore = await headers();
  const siteOrigin = siteOriginFromHeaders(headerStore);
  const listingPath = listingPublicPath(listing.id);
  const canonical = buildCanonicalUrl(listingPath, headerStore);
  const description = buildListingOgDescription(listing.description, listing.locationLabel);
  const rawImage = pickListingOpenGraphImagePath({
    photoUrls: listing.photos,
    profileImageUrl: listing.profileImageUrl,
  });
  const imageUrl = publicAssetUrl(rawImage, siteOrigin);
  const title = `${listing.displayName} | KasiFind`;

  return {
    title: listing.displayName,
    description,
    alternates: buildCanonicalAlternates(listingPath, headerStore),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "KasiFind",
      locale: "en_ZA",
      type: "website",
      images: [{ url: imageUrl, alt: listing.displayName }],
    },
    twitter: {
      ...buildPublicTwitter(title, description),
      images: [imageUrl],
    },
  };
}

export default async function KasiFindProviderPage({ params }: Props) {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card p-6">
        <p>KasiFind is not configured on this server.</p>
      </div>
    );
  }

  const { id } = await params;
  const sessionUser = await getKasiFindSessionUser();
  const resolved = await resolveProviderListingPage(id, sessionUser?.id ?? null);
  if (!resolved) notFound();
  const { listing, ownerPreview } = resolved;

  const serviceHint = listing.services[0]?.name;
  const waPhone = (listing.whatsapp || listing.phone || "").trim();
  const waUrl =
    waPhone.replace(/\D/g, "").length >= 9
      ? buildWhatsAppUrl(waPhone, defaultEnquiryMessage(listing.displayName, serviceHint))
      : null;
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const siteOrigin = siteOriginFromHeaders(headerStore);
  const directionsUrl = pickDirectionsUrl(
    listing.map.latitude,
    listing.map.longitude,
    listing.locationLabel,
    userAgent
  );
  const showPersistentContactBar = publicListingShowsContactBar(
    waUrl,
    listing.phone,
    directionsUrl,
    listing.id
  );
  const browseCategories =
    !ownerPreview && isKasiFindDbConfigured()
      ? await listKfCategories().then((rows) =>
          rows.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))
        )
      : [];
  const primaryCategory = listing.categories[0];
  const jsonLdOrigin = resolvePublicSiteOrigin(headerStore);
  const canonicalForJson =
    jsonLdOrigin != null ? listingPublicUrl(listing.id, jsonLdOrigin) : listingPublicPath(listing.id);
  const listingJsonLd =
    !ownerPreview && jsonLdOrigin
      ? buildListingJsonLd({
          listing,
          canonicalUrl: canonicalForJson.startsWith("http")
            ? canonicalForJson
            : `${jsonLdOrigin.replace(/\/$/, "")}${canonicalForJson}`,
          siteOrigin: jsonLdOrigin,
        })
      : null;

  return (
    <article
      className={`pb-8${showPersistentContactBar ? " kf-listing-page-public--sticky-contact" : ""}`}
    >
      <KfListingLcpPreload profileImageUrl={listing.profileImageUrl} siteOrigin={siteOrigin} />
      {listingJsonLd ? <KfListingJsonLd data={listingJsonLd} /> : null}
      <KfListingPageScrollTop listingId={listing.id} />
      <KfTrackListingView listingId={listing.id} />
      <Link
        href={ownerPreview ? "/account/listing" : "/"}
        scroll={false}
        className="kf-link inline-flex items-center gap-1 text-sm kf-animate-in"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {ownerPreview ? "Back to your listing" : "Back to search"}
      </Link>

      {ownerPreview ? (
        <div className="kf-alert-info mt-4 kf-animate-in" role="status">
          <strong>Owner preview</strong> — only you can see this page until moderation approves your
          listing. It is not visible in search yet.
        </div>
      ) : null}

      <header className="kf-card kf-listing-page-hero mt-3 overflow-hidden kf-animate-in sm:mt-4">
        <div className="kf-trust-strip kf-listing-page-hero-trust">
          <span className="kf-trust-pill">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Local listing
          </span>
        </div>
        {listing.profileImageUrl ? (
          <KfListingProfileHero src={listing.profileImageUrl} alt={listing.displayName} />
        ) : null}
        <div className="kf-listing-hero-identity relative bg-[var(--kf-stone)]">
          {!listing.profileImageUrl ? (
            <div className="kf-business-avatar-placeholder mx-auto sm:mx-0" aria-hidden>
              <Building2 className="h-8 w-8 opacity-80" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--kf-muted)]">
                Local business
              </span>
            </div>
          ) : null}
          <div
            className={`kf-listing-hero-meta min-w-0 flex-1 text-center sm:text-left${
              !listing.profileImageUrl ? " kf-listing-hero-meta--with-placeholder" : ""
            }`}
          >
            <h1 className="kf-listing-hero-title">{listing.displayName}</h1>
            {primaryCategory ? (
              <p className="kf-listing-hero-category">{primaryCategory.name}</p>
            ) : null}
            <p className="kf-listing-hero-location">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {listing.locationLabel}
            </p>
            {listing.reviewCount > 0 && listing.averageRating !== null ? (
              <div className="kf-listing-hero-rating">
                <KfListingRatingDisplay
                  averageRating={listing.averageRating}
                  reviewCount={listing.reviewCount}
                  variant="hero"
                  showUnverifiedNote
                />
              </div>
            ) : (
              <div className="kf-listing-hero-unrated">
                <p className="kf-rating-unrated">Not yet rated</p>
                <p className="kf-early-badge kf-early-badge--listing">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  New on KasiFind — be among the first to leave a review
                </p>
              </div>
            )}
            {(listing.priceHint || listing.hoursNote) && (
              <dl className="kf-listing-hero-hours space-y-0.5 text-sm">
                {listing.priceHint ? (
                  <div>
                    <dt className="inline font-semibold text-[var(--kf-charcoal)]">Pricing: </dt>
                    <dd className="inline text-[var(--kf-muted)]">{listing.priceHint}</dd>
                  </div>
                ) : null}
                {listing.hoursNote ? (
                  <div>
                    <dt className="inline font-semibold text-[var(--kf-charcoal)]">Hours: </dt>
                    <dd className="inline text-[var(--kf-muted)]">{listing.hoursNote}</dd>
                  </div>
                ) : null}
              </dl>
            )}
          </div>
        </div>

      </header>

      <KfListingDetailTabs
        listingId={listing.id}
        ownerPreview={ownerPreview}
        description={listing.description}
        categories={listing.categories}
        services={listing.services}
        photos={listing.photos.map((url, i) => ({
          src: url,
          alt: `Work sample ${i + 1} from ${listing.displayName}`,
        }))}
        reviews={listing.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          body: r.body,
          authorName: r.authorName,
        }))}
      />

      <div id="kf-listing-map" className="mt-8 kf-animate-in">
        <KfProviderLocationMap locationLabel={listing.locationLabel} map={listing.map} />
      </div>

      {!ownerPreview ? (
        <KfListingNearbySection listingId={listing.id} categorySlug={primaryCategory?.slug ?? null} />
      ) : null}

      {!ownerPreview && browseCategories.length > 0 ? (
        <KfListingCategoryStrip categories={browseCategories} listingId={listing.id} />
      ) : null}

      <div className="mt-6">
        <KfReportForm listingId={listing.id} />
      </div>

      {showPersistentContactBar ? (
        <KfListingPersistentContactBar
          listingId={listing.id}
          displayName={listing.displayName}
          waUrl={waUrl}
          callPhone={listing.phone}
          directionsUrl={directionsUrl}
        />
      ) : null}
    </article>
  );
}

import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, MapPin, MessageSquare, ShieldCheck, Sparkles, Star } from "lucide-react";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { resolveProviderListingPage } from "@/lib/kasifind/listing-public";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { pickDirectionsUrl } from "@/lib/kasifind/navigation-urls";
import { publicAssetUrl, siteOriginFromHeaders } from "@/lib/kasifind/public-asset-url";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { KfReviewForm } from "@/components/kasifind/kf-review-form";
import { KfReportForm } from "@/components/kasifind/kf-report-form";
import { KfContactBar } from "@/components/kasifind/kf-contact-bar";
import { KfTrackListingView } from "@/components/kasifind/kf-track-listing-view";
import { KfProviderLocationMap } from "@/components/kasifind/kf-provider-location-map";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

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
  const waPhone = listing.whatsapp || listing.phone;
  const waUrl = buildWhatsAppUrl(waPhone, defaultEnquiryMessage(listing.displayName, serviceHint));
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const siteOrigin = siteOriginFromHeaders(headerStore);
  const directionsUrl = pickDirectionsUrl(
    listing.map.latitude,
    listing.map.longitude,
    listing.locationLabel,
    userAgent
  );

  return (
    <article className="pb-24 sm:pb-8">
      <KfTrackListingView listingId={listing.id} />
      <Link
        href={ownerPreview ? "/account/listing" : "/"}
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

      <header className="kf-card mt-4 overflow-hidden kf-animate-in">
        <div className="kf-trust-strip">
          <span className="kf-trust-pill">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Local listing
          </span>
          <span>Contact via WhatsApp or call — no booking fees</span>
        </div>
        <div className="relative bg-[var(--kf-stone)] p-6 sm:flex sm:gap-6">
          {listing.profileImageUrl ? (
            <KfListingImage
              src={publicAssetUrl(listing.profileImageUrl, siteOrigin)}
              alt=""
              className="mx-auto h-28 w-28 rounded-xl object-cover ring-2 ring-white sm:mx-0"
              priority
            />
          ) : (
            <div className="kf-business-avatar-placeholder mx-auto sm:mx-0" aria-hidden>
              <Building2 className="h-8 w-8 opacity-80" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--kf-muted)]">
                Local business
              </span>
            </div>
          )}
          <div className="mt-4 min-w-0 flex-1 text-center sm:mt-0 sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-charcoal)]">
              {listing.displayName}
            </h1>
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-[var(--kf-muted)] sm:justify-start">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {listing.locationLabel}
            </p>
            {listing.reviewCount > 0 && listing.averageRating !== null ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm sm:justify-start">
                <Star className="h-4 w-4 fill-[var(--kf-ochre)] text-[var(--kf-ochre)]" aria-hidden />
                <span className="font-semibold">{listing.averageRating.toFixed(1)}</span>
                <span className="text-[var(--kf-muted)]">
                  · {listing.reviewCount} unverified review{listing.reviewCount === 1 ? "" : "s"}
                </span>
              </p>
            ) : (
              <div className="mt-3 flex justify-center sm:justify-start">
                <p className="kf-early-badge">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  New on KasiFind — reviews will grow as neighbours share experiences
                </p>
              </div>
            )}
            {(listing.priceHint || listing.hoursNote) && (
              <dl className="mt-4 space-y-1 text-sm">
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

        <div className="border-t border-[var(--kf-border)] p-6">
          <div className="flex flex-wrap gap-2">
            {listing.categories.map((c) => (
              <span key={c.slug} className="kf-chip">
                {c.name}
              </span>
            ))}
          </div>

          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-[var(--kf-text)]">
            {listing.description}
          </p>

          {listing.services.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {listing.services.map((s) => (
                <li
                  key={s.name}
                  className="rounded-md border border-[var(--kf-border)] bg-[var(--kf-ivory)] px-3 py-1.5 text-sm font-medium"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}

          <div className="hidden sm:block">
            <KfContactBar
              waUrl={waUrl}
              phone={listing.phone}
              directionsUrl={directionsUrl}
              listingId={listing.id}
            />
          </div>
        </div>
      </header>

      <KfProviderLocationMap locationLabel={listing.locationLabel} map={listing.map} />

      <section className="mt-8 kf-animate-in">
        <h2 className="kf-section-title">Work gallery</h2>
        <p className="kf-section-sub mt-1">Photos from this provider&apos;s listing.</p>
        {listing.photos.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {listing.photos.map((url) => (
              <KfListingImage
                key={url}
                src={publicAssetUrl(url, siteOrigin)}
                alt="Work sample from provider listing"
                className="aspect-square rounded-lg object-cover ring-1 ring-[var(--kf-border)]"
                priority
              />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <KfEmptyState
              title="No work photos yet"
              description="This provider has not uploaded gallery photos. You can still message them to ask for examples of past jobs."
            />
          </div>
        )}
      </section>

      <section className="kf-card mt-8 p-6 kf-animate-in">
        <h2 className="kf-section-title">Community reviews</h2>
        <p className="mt-1 text-xs text-[var(--kf-muted)]">
          KasiFind is growing — honest reviews from real customers help build trust over time.
        </p>
        <ul className="mt-4 space-y-4">
          {listing.reviews.length === 0 ? (
            <li>
              <KfEmptyState
                icon={<MessageSquare className="h-6 w-6" aria-hidden />}
                title="Be the first to review"
                description="Used this provider? Your experience helps others in the community. There is no pressure — only share if you have genuinely worked with them."
              />
            </li>
          ) : (
            listing.reviews.map((r) => (
              <li key={r.id} className="border-t border-[var(--kf-border)] pt-4 first:border-0 first:pt-0">
                <p className="flex items-center gap-1 text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 fill-[var(--kf-ochre)] text-[var(--kf-ochre)]" aria-hidden />
                  {r.rating}/5 · {r.authorName ?? "Community member"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--kf-text)]">{r.body}</p>
              </li>
            ))
          )}
        </ul>
        {ownerPreview ? (
          <p className="mt-4 text-sm text-[var(--kf-muted)]">
            Reviews open once your listing is live for everyone.
          </p>
        ) : (
          <KfReviewForm listingId={listing.id} />
        )}
      </section>

      <div className="mt-6">
        <KfReportForm listingId={listing.id} />
      </div>

      <div className="sm:hidden">
        <KfContactBar
          waUrl={waUrl}
          phone={listing.phone}
          directionsUrl={directionsUrl}
          listingId={listing.id}
        />
      </div>
    </article>
  );
}

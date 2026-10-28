import Link from "next/link";
import { notFound } from "next/navigation";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { getPublicListing } from "@/lib/kasifind/listing-public";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";
import { KfReviewForm } from "@/components/kasifind/kf-review-form";
import { KfReportForm } from "@/components/kasifind/kf-report-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function KasiFindProviderPage({ params }: Props) {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card rounded-2xl p-6">
        <p>KasiFind is not configured on this server.</p>
      </div>
    );
  }

  const { id } = await params;
  const listing = await getPublicListing(id);
  if (!listing) notFound();

  const serviceHint = listing.services[0]?.name;
  const waPhone = listing.whatsapp || listing.phone;
  const waUrl = buildWhatsAppUrl(waPhone, defaultEnquiryMessage(listing.displayName, serviceHint));

  return (
    <article className="space-y-6">
      <Link href="/kasifind" className="text-sm font-medium text-[var(--kf-green-dark)] underline">
        ← Back to search
      </Link>

      <header className="kf-card rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          {listing.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.profileImageUrl}
              alt=""
              className="h-28 w-28 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[var(--kf-sand)] text-sm text-[var(--kf-muted)]">
              Business photo
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[var(--kf-green-dark)]">{listing.displayName}</h1>
            <p className="mt-1 text-[var(--kf-muted)]">{listing.locationLabel}</p>
            {listing.reviewCount > 0 && listing.averageRating !== null ? (
              <p className="mt-2 text-sm">
                ★ {listing.averageRating.toFixed(1)} · {listing.reviewCount} community review
                {listing.reviewCount === 1 ? "" : "s"} (unverified)
              </p>
            ) : (
              <p className="mt-2 text-sm text-[var(--kf-muted)]">No reviews yet</p>
            )}
            {listing.priceHint && (
              <p className="mt-2 text-sm font-medium">Indicative pricing: {listing.priceHint}</p>
            )}
            {listing.hoursNote && (
              <p className="text-sm text-[var(--kf-muted)]">Hours: {listing.hoursNote}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {listing.categories.map((c) => (
            <span key={c.slug} className="kf-chip rounded-full px-3 py-1">
              {c.name}
            </span>
          ))}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-[var(--kf-ink)]">{listing.description}</p>

        {listing.services.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {listing.services.map((s) => (
              <li key={s.name} className="rounded-lg border border-black/10 px-2 py-1 text-sm">
                {s.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="kf-btn-primary rounded-xl py-3 text-center font-semibold"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${listing.phone.replace(/\s/g, "")}`}
            className="kf-btn-outline rounded-xl py-3 text-center"
          >
            Call {listing.phone}
          </a>
        </div>
      </header>

      {listing.photos.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Work photos</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {listing.photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="Provider work sample"
                className="aspect-square rounded-xl object-cover"
              />
            ))}
          </div>
        </section>
      )}

      <section className="kf-card rounded-2xl p-5">
        <h2 className="text-lg font-bold">Reviews</h2>
        <p className="text-xs text-[var(--kf-muted)]">
          Reviews are from community members and are not verified purchases.
        </p>
        <ul className="mt-4 space-y-3">
          {listing.reviews.map((r) => (
            <li key={r.id} className="border-t border-black/5 pt-3 first:border-0 first:pt-0">
              <p className="font-medium">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)} · {r.authorName ?? "Community member"}
              </p>
              <p className="mt-1 text-sm">{r.body}</p>
            </li>
          ))}
        </ul>
        <KfReviewForm listingId={listing.id} />
      </section>

      <KfReportForm listingId={listing.id} />
    </article>
  );
}

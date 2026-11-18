import Link from "next/link";
import { KfAdminListingQuickActions } from "@/components/kasifind/admin/kf-admin-listing-quick-actions";
import { kfAdminResolveReportAction } from "@/lib/kasifind/admin-actions";
import { buildAdminListingsDetailHref } from "@/lib/kasifind/admin-listings-nav";
import { buildAdminProvidersDetailHref } from "@/lib/kasifind/admin-providers-nav";
import type { AdminModerationTab } from "@/lib/kasifind/admin-moderation-nav";
import {
  getAdminModerationPendingDetail,
  getAdminModerationReportDetail,
  getAdminModerationReviewDetail,
} from "@/lib/kasifind/admin-moderation";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";

type Props = {
  tab: AdminModerationTab;
  itemId: string;
};

export async function KfAdminModerationDetail({ tab, itemId }: Props) {
  if (tab === "reports") {
    const report = await getAdminModerationReportDetail(itemId);
    if (!report) {
      return <p className="text-sm text-[var(--kf-muted)]">Report not found.</p>;
    }
    const listing = report.listing;
    return (
      <div className="kf-admin-moderation-detail">
        <header className="kf-admin-moderation-detail__hero">
          <h3 className="kf-admin-moderation-detail__title">User report</h3>
          <p className="text-sm text-[var(--kf-muted)]">{formatKfDateTime(report.createdAt.toISOString())}</p>
        </header>
        <section className="kf-admin-moderation-detail__card">
          <p className="font-semibold">{report.reason}</p>
          {report.details ? <p className="mt-2 whitespace-pre-wrap text-sm">{report.details}</p> : null}
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Listing</dt>
              <dd>
                {listing ? (
                  <Link href={buildAdminListingsDetailHref(listing.id, {})} className="underline">
                    {listing.displayName}
                  </Link>
                ) : (
                  "Removed or unknown"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Reporter</dt>
              <dd>{report.reporter?.email ?? "Anonymous"}</dd>
            </div>
          </dl>
        </section>
        {listing ? (
          <section className="kf-admin-moderation-detail__pinned">
            <h4 className="kf-admin-moderation-detail__section-title">Listing actions</h4>
            <KfAdminListingQuickActions
              listingId={listing.id}
              featured={listing.featured}
              compact
            />
          </section>
        ) : null}
        {!report.resolved ? (
          <form action={kfAdminResolveReportAction}>
            <input type="hidden" name="reportId" value={report.id} />
            <button type="submit" className="kf-btn kf-btn-primary text-sm">
              Mark report resolved
            </button>
          </form>
        ) : (
          <p className="text-sm text-[var(--kf-muted)]">This report is already resolved.</p>
        )}
      </div>
    );
  }

  if (tab === "reviews") {
    const review = await getAdminModerationReviewDetail(itemId);
    if (!review) {
      return <p className="text-sm text-[var(--kf-muted)]">Review not found.</p>;
    }
    return (
      <div className="kf-admin-moderation-detail">
        <header className="kf-admin-moderation-detail__hero">
          <h3 className="kf-admin-moderation-detail__title">
            {review.rating}★ review — {review.listing.displayName}
          </h3>
          <p className="text-sm text-[var(--kf-muted)]">
            {review.authorName ?? review.user?.name ?? "Visitor"}
            {review.user?.email ? ` · ${review.user.email}` : ""} ·{" "}
            {formatKfDateTime(review.createdAt.toISOString())}
          </p>
        </header>
        <section className="kf-admin-moderation-detail__card">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{review.body}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Visibility</dt>
              <dd>{review.hidden ? "Hidden from public" : "Visible on listing"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Verified</dt>
              <dd>{review.verified ? "Yes" : "No"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[var(--kf-muted)]">
            Read-only overview — review moderation tools are not enabled in this phase.
          </p>
        </section>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildAdminListingsDetailHref(review.listing.id, {})}
            className="kf-btn kf-btn-outline text-sm"
          >
            Open listing workspace
          </Link>
          <Link href={`/providers/${review.listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Public listing
          </Link>
        </div>
      </div>
    );
  }

  const listing = await getAdminModerationPendingDetail(itemId);
  if (!listing) {
    return <p className="text-sm text-[var(--kf-muted)]">Listing not found.</p>;
  }

  const categories = listing.categories.map((c) => c.category.name).join(", ");

  return (
    <div className="kf-admin-moderation-detail">
      <header className="kf-admin-moderation-detail__hero">
        <h3 className="kf-admin-moderation-detail__title">{listing.displayName}</h3>
        <p className="text-sm text-[var(--kf-muted)]">
          <Link href={buildAdminProvidersDetailHref(listing.user.id, {})} className="underline">
            {listing.user.email}
          </Link>
          {" · "}
          {listing.status} · moderation {listing.moderationStatus}
        </p>
      </header>
      <section className="kf-admin-moderation-detail__card">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Location</dt>
            <dd>{listing.locationLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Categories</dt>
            <dd>{categories || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-[var(--kf-muted)]">Community</dt>
            <dd>
              {listing._count.reviews} reviews · {listing._count.reports} reports
            </dd>
          </div>
        </dl>
      </section>
      <section className="kf-admin-moderation-detail__pinned">
        <h4 className="kf-admin-moderation-detail__section-title">Moderation actions</h4>
        <KfAdminListingQuickActions listingId={listing.id} featured={listing.featured} />
        <Link
          href={buildAdminListingsDetailHref(listing.id, {})}
          className="kf-btn kf-btn-outline mt-3 text-sm"
        >
          Full listing workspace
        </Link>
      </section>
    </div>
  );
}
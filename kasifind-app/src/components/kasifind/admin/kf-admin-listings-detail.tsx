import Link from "next/link";
import { KfAdminListingQuickActions } from "@/components/kasifind/admin/kf-admin-listing-quick-actions";
import { KfContactClickLog } from "@/components/kasifind/kf-contact-click-log";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";
import { formatKfClickIdentity, getListingContactClickLog } from "@/lib/kasifind/contact-click-log";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import type { getAdminListingDetail } from "@/lib/kasifind/admin-listings";
import type { listKfCategories } from "@/lib/kasifind/categories";
import { buildAdminProvidersDetailHref } from "@/lib/kasifind/admin-providers-nav";

type ListingDetail = NonNullable<Awaited<ReturnType<typeof getAdminListingDetail>>>;
type Categories = Awaited<ReturnType<typeof listKfCategories>>;

type Props = {
  data: ListingDetail;
  categories: Categories;
};

export async function KfAdminListingsDetail({ data, categories }: Props) {
  const { listing, metrics, recentEvents } = data;
  const contactClickLog = await getListingContactClickLog(listing.id, { limit: 200 });

  const listingData = {
    listingId: listing.id,
    displayName: listing.displayName,
    description: listing.description,
    phone: listing.phone,
    whatsapp: listing.whatsapp,
    locationLabel: listing.locationLabel,
    latitude: listing.latitude,
    longitude: listing.longitude,
    hideExactLocation: listing.hideExactLocation,
    priceHint: listing.priceHint,
    hoursNote: listing.hoursNote,
    status: listing.status,
    moderationStatus: listing.moderationStatus,
    categoryIds: listing.categories.map((c) => c.categoryId),
    services: listing.services.map((s) => s.name),
    photos: listing.photos.map((p) => ({ id: p.id, url: p.url })),
    profileImageUrl: listing.profileImageUrl,
  };

  const categoryNames = listing.categories.map((c) => c.category.name).join(", ");

  return (
    <div className="kf-admin-listings-detail">
      <header className="kf-admin-listings-detail__hero">
        <div>
          <h3 className="kf-admin-listings-detail__title">{listing.displayName}</h3>
          <p className="kf-admin-listings-detail__meta">
            <Link href={buildAdminProvidersDetailHref(listing.user.id, {})} className="underline">
              {listing.user.email}
            </Link>
            {listing.user.name ? ` · ${listing.user.name}` : ""}
            {listing.user.suspended ? " · Suspended" : ""}
          </p>
          <dl className="kf-admin-listings-detail__facts">
            <div>
              <dt>Status</dt>
              <dd>
                {listing.status} · {listing.moderationStatus}
                {listing.featured ? " · Featured" : ""}
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{listing.locationLabel}</dd>
            </div>
            {categoryNames ? (
              <div>
                <dt>Categories</dt>
                <dd>{categoryNames}</dd>
              </div>
            ) : null}
            <div>
              <dt>Engagement</dt>
              <dd>
                {metrics.impressions} impressions · {metrics.views} views · {metrics.clicks} contact clicks
              </dd>
            </div>
          </dl>
        </div>
        <div className="kf-admin-listings-detail__links">
          <Link href={`/providers/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Public listing
          </Link>
        </div>
      </header>

      <section className="kf-admin-listings-detail__pinned">
        <h4 className="kf-admin-listings-detail__section-title">Quick actions</h4>
        <KfAdminListingQuickActions listingId={listing.id} featured={listing.featured} />
      </section>

      <details className="kf-admin-details kf-admin-listings-detail__accordion">
        <summary>Listing copy & details</summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium">Phone</dt>
            <dd>{listing.phone}</dd>
          </div>
          <div>
            <dt className="font-medium">WhatsApp</dt>
            <dd>{listing.whatsapp ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Services</dt>
            <dd>{listing.services.map((s) => s.name).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Reviews / reports</dt>
            <dd>
              {listing._count.reviews} reviews · {listing._count.reports} reports
            </dd>
          </div>
        </dl>
      </details>

      <details className="kf-admin-details kf-admin-listings-detail__accordion">
        <summary>Contact click log</summary>
        <div className="mt-3">
          <KfContactClickLog
            rows={contactClickLog}
            title="Contact clicks"
            emptyMessage="No WhatsApp, call, or directions taps recorded yet."
          />
        </div>
      </details>

      {recentEvents.length > 0 ? (
        <details className="kf-admin-details kf-admin-listings-detail__accordion">
          <summary>Recent analytics ({recentEvents.length})</summary>
          <div className="kf-admin-table-wrap mt-3">
            <table className="kf-admin-data-table text-sm">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Who</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((e) => (
                  <tr key={e.id}>
                    <td className="text-xs">{formatKfDateTime(e.createdAt)}</td>
                    <td className="text-sm">{e.eventType.replace(/_/g, " ")}</td>
                    <td className="text-sm">
                      {
                        formatKfClickIdentity({
                          userName: e.user?.name ?? null,
                          userEmail: e.user?.email ?? null,
                          visitorId: e.visitorId,
                        }).label
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      <section className="kf-admin-listings-detail__editor">
        <h4 className="kf-admin-listings-detail__section-title">Edit listing (admin)</h4>
        <p className="mb-4 text-sm text-[var(--kf-muted)]">
          Uses the provider editor with lifecycle preserved. Each field change is recorded in the admin audit
          log (separate from listing assistance).
        </p>
        <KfListingForm
          categories={categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            children: c.children.map((ch) => ({ id: ch.id, slug: ch.slug, name: ch.name })),
          }))}
          listing={listingData}
          userEmail={listing.user.email}
          adminEdit={{ listingId: listing.id }}
        />
      </section>
    </div>
  );
}
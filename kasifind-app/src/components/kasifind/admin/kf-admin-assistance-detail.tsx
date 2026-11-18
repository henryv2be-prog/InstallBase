import Link from "next/link";
import { KfAdminAssistanceControls } from "@/components/kasifind/kf-admin-assistance-controls";
import { KfAdminAssistanceImages } from "@/components/kasifind/kf-admin-assistance-images";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import type { getAdminAssistanceRequestDetail } from "@/lib/kasifind/listing-assistance";
import type { listKfCategories } from "@/lib/kasifind/categories";

type RequestDetail = NonNullable<Awaited<ReturnType<typeof getAdminAssistanceRequestDetail>>>;
type Categories = Awaited<ReturnType<typeof listKfCategories>>;

type ImageRow = { imageKey: string; label: string; url: string };

type Props = {
  request: RequestDetail;
  categories: Categories;
  images: ImageRow[];
};

export function KfAdminAssistanceDetail({ request, categories, images }: Props) {
  const listing = request.listing;
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
    <div className="kf-admin-assistance-detail">
      <header className="kf-admin-assistance-detail__hero">
        <div>
          <h3 className="kf-admin-assistance-detail__title">{listing.displayName}</h3>
          <p className="kf-admin-assistance-detail__meta">
            {listing.user.email}
            {listing.user.name ? ` · ${listing.user.name}` : ""}
          </p>
          <dl className="kf-admin-assistance-detail__facts">
            <div>
              <dt>Requested</dt>
              <dd>{formatKfDateTime(request.createdAt.toISOString())}</dd>
            </div>
            <div>
              <dt>Listing</dt>
              <dd>
                {listing.status} · {listing.moderationStatus}
              </dd>
            </div>
            {categoryNames ? (
              <div>
                <dt>Categories</dt>
                <dd>{categoryNames}</dd>
              </div>
            ) : null}
            <div>
              <dt>Location</dt>
              <dd>{listing.locationLabel}</dd>
            </div>
          </dl>
        </div>
        <div className="kf-admin-assistance-detail__links">
          <Link href={`/providers/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Public listing
          </Link>
          <Link href={`/admin/listings/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Admin listing
          </Link>
        </div>
      </header>

      {request.providerMessage ? (
        <blockquote className="kf-admin-assistance-detail__message">
          <p className="kf-admin-assistance-detail__message-kicker">Provider message</p>
          <p className="whitespace-pre-wrap">{request.providerMessage}</p>
        </blockquote>
      ) : null}

      <section className="kf-admin-assistance-detail__pinned">
        <h4 className="kf-admin-assistance-detail__section-title">Manage request</h4>
        <KfAdminAssistanceControls
          requestId={request.id}
          status={request.status}
          adminNotes={request.adminNotes}
        />
      </section>

      <KfAdminAssistanceImages requestId={request.id} displayName={listing.displayName} images={images} />

      {request.statusEvents.length > 0 ? (
        <details className="kf-admin-details kf-admin-assistance-detail__accordion">
          <summary>Status history ({request.statusEvents.length})</summary>
          <ul className="mt-3 space-y-2 text-sm">
            {request.statusEvents.map((ev) => (
              <li key={ev.id} className="border-b border-[var(--kf-border)] pb-2 last:border-0">
                <span className="text-[var(--kf-muted)]">{formatKfDateTime(ev.createdAt.toISOString())}</span>
                {" · "}
                {ev.fromStatus ? `${ev.fromStatus} → ` : ""}
                <strong>{ev.toStatus}</strong>
                {" · "}
                {ev.admin.name ?? ev.admin.email}
                {ev.note ? <p className="mt-1 text-[var(--kf-muted)]">Note: {ev.note}</p> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {request.auditEntries.length > 0 ? (
        <details className="kf-admin-details kf-admin-assistance-detail__accordion">
          <summary>Listing change audit ({request.auditEntries.length})</summary>
          <div className="kf-admin-table-wrap mt-3">
            <table className="kf-admin-data-table text-sm">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Field</th>
                  <th>Previous</th>
                  <th>New</th>
                </tr>
              </thead>
              <tbody>
                {request.auditEntries.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-xs text-[var(--kf-muted)]">
                      {formatKfDateTime(row.createdAt.toISOString())}
                    </td>
                    <td>{row.fieldName}</td>
                    <td className="max-w-[10rem] truncate text-[var(--kf-muted)]" title={row.previousValue ?? ""}>
                      {row.previousValue ?? "—"}
                    </td>
                    <td className="max-w-[10rem] truncate" title={row.newValue ?? ""}>
                      {row.newValue ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      <section className="kf-admin-assistance-detail__editor">
        <h4 className="kf-admin-assistance-detail__section-title">Edit listing for provider</h4>
        <p className="mb-4 text-sm text-[var(--kf-muted)]">
          Uses the same editor as providers. Upload corrected photos here; changes save to their listing
          and appear in the audit log.
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
          adminAssist={{ assistanceRequestId: request.id }}
        />
      </section>
    </div>
  );
}
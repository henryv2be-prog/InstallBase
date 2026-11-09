import Link from "next/link";
import { notFound } from "next/navigation";
import { KfAdminAssistanceControls } from "@/components/kasifind/kf-admin-assistance-controls";
import { KfListingForm } from "@/components/kasifind/kf-listing-form";
import { listKfCategories } from "@/lib/kasifind/categories";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import { getAdminAssistanceRequestDetail } from "@/lib/kasifind/listing-assistance";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminListingAssistanceDetailPage({ params }: Props) {
  const { id } = await params;
  const [request, categories] = await Promise.all([
    getAdminAssistanceRequestDetail(id),
    listKfCategories(),
  ]);
  if (!request) notFound();

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

  return (
    <div className="space-y-6">
      <Link href="/admin/listing-assistance" className="text-sm underline">
        ← Listing assistance
      </Link>

      <header className="kf-card p-5">
        <h2 className="text-xl font-bold">{listing.displayName}</h2>
        <p className="mt-1 text-sm text-[var(--kf-muted)]">
          {listing.user.email}
          {listing.user.name ? ` · ${listing.user.name}` : ""}
        </p>
        <p className="mt-2 text-sm">
          Requested {formatKfDateTime(request.createdAt.toISOString())}
        </p>
        {request.providerMessage ? (
          <blockquote className="mt-3 rounded-xl border border-[var(--kf-border)] bg-[var(--kf-ivory)] px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--kf-muted)]">
              Provider message
            </p>
            <p className="mt-1 whitespace-pre-wrap">{request.providerMessage}</p>
          </blockquote>
        ) : (
          <p className="mt-3 text-sm text-[var(--kf-muted)]">No message from the provider.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/providers/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Public listing
          </Link>
          <Link href={`/admin/listings/${listing.id}`} className="kf-btn kf-btn-outline text-sm">
            Admin listing view
          </Link>
        </div>
      </header>

      <section className="kf-card p-5">
        <h3 className="font-semibold">Manage request</h3>
        <KfAdminAssistanceControls
          requestId={request.id}
          status={request.status}
          adminNotes={request.adminNotes}
        />
      </section>

      {request.statusEvents.length > 0 ? (
        <section className="kf-card p-5">
          <h3 className="font-semibold">Status history</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {request.statusEvents.map((ev) => (
              <li key={ev.id} className="border-b border-[var(--kf-border)] pb-2 last:border-0">
                <span className="text-[var(--kf-muted)]">{formatKfDateTime(ev.createdAt.toISOString())}</span>
                {" · "}
                {ev.fromStatus ? `${ev.fromStatus} → ` : ""}
                <strong>{ev.toStatus}</strong>
                {" · "}
                {ev.admin.name ?? ev.admin.email}
                {ev.note ? (
                  <p className="mt-1 text-[var(--kf-muted)]">Note: {ev.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {request.auditEntries.length > 0 ? (
        <section className="kf-card p-5">
          <h3 className="font-semibold">Listing change audit</h3>
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
                    <td className="max-w-[12rem] truncate text-[var(--kf-muted)]" title={row.previousValue ?? ""}>
                      {row.previousValue ?? "—"}
                    </td>
                    <td className="max-w-[12rem] truncate" title={row.newValue ?? ""}>
                      {row.newValue ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="kf-admin-section-title">Edit listing for provider</h3>
        <p className="mb-4 text-sm text-[var(--kf-muted)]">
          Uses the same editor as providers. Changes save to their live listing and are recorded in the audit
          log above.
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

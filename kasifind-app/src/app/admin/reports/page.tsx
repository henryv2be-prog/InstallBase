import Link from "next/link";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  kfAdminModerateListingAction,
  kfAdminResolveReportAction,
} from "@/lib/kasifind/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const kf = getKasiFindPrisma();
  const [pending, reports] = await Promise.all([
    kf.kfProviderListing.findMany({
      where: { moderationStatus: "PENDING", status: { in: ["PUBLISHED", "DRAFT"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { user: { select: { email: true } } },
    }),
    kf.kfReport.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { listing: { select: { id: true, displayName: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="kf-admin-section-title">Listings awaiting review ({pending.length})</h2>
        <ul className="mt-3 space-y-3">
          {pending.length === 0 ? (
            <li className="text-sm text-[var(--kf-muted)]">No pending listings.</li>
          ) : (
            pending.map((row) => (
              <li key={row.id} className="kf-card rounded-xl p-4">
                <p className="font-semibold">{row.displayName}</p>
                <p className="text-xs text-[var(--kf-muted)]">
                  {row.user.email} · {row.locationLabel} · {row.status}
                </p>
                <p className="mt-2 line-clamp-3 text-sm">{row.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={kfAdminModerateListingAction}>
                    <input type="hidden" name="listingId" value={row.id} />
                    <input type="hidden" name="decision" value="APPROVED" />
                    <button type="submit" className="kf-btn kf-btn-primary text-sm">
                      Approve
                    </button>
                  </form>
                  <form action={kfAdminModerateListingAction}>
                    <input type="hidden" name="listingId" value={row.id} />
                    <input type="hidden" name="decision" value="REJECTED" />
                    <button type="submit" className="kf-btn kf-btn-outline text-sm">
                      Reject
                    </button>
                  </form>
                  <Link href={`/admin/listings/${row.id}`} className="self-center text-sm underline">
                    Details
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="kf-admin-section-title">Open reports ({reports.length})</h2>
        <ul className="mt-3 space-y-3">
          {reports.length === 0 ? (
            <li className="text-sm text-[var(--kf-muted)]">No open reports.</li>
          ) : (
            reports.map((r) => (
              <li key={r.id} className="kf-card rounded-xl p-4 text-sm">
                <p className="font-medium">
                  {r.listing ? (
                    <Link href={`/admin/listings/${r.listing.id}`} className="underline">
                      {r.listing.displayName}
                    </Link>
                  ) : (
                    "Unknown listing"
                  )}
                </p>
                <p>{r.reason}</p>
                {r.details ? <p className="text-[var(--kf-muted)]">{r.details}</p> : null}
                <form action={kfAdminResolveReportAction} className="mt-2">
                  <input type="hidden" name="reportId" value={r.id} />
                  <button type="submit" className="text-xs underline">
                    Mark resolved
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { isKasiFindDbConfigured, getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";
import {
  kfAdminModerateListingAction,
  kfAdminResolveReportAction,
} from "@/lib/kasifind/admin-actions";

export const dynamic = "force-dynamic";

export default async function KasiFindAdminPage() {
  if (!isKasiFindDbConfigured()) {
    return <p>KasiFind database not configured.</p>;
  }

  const auth = await requireKasiFindAdmin();
  if ("error" in auth) redirect("/kasifind/account/login");

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
      take: 30,
      include: { listing: { select: { displayName: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-[var(--kf-green-dark)]">KasiFind admin</h1>
        <Link href="/kasifind" className="text-sm underline">
          Public site
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-bold">Listings awaiting review ({pending.length})</h2>
        <ul className="mt-3 space-y-3">
          {pending.length === 0 && (
            <li className="text-sm text-[var(--kf-muted)]">No pending listings.</li>
          )}
          {pending.map((row) => (
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
                  <button type="submit" className="kf-btn-primary rounded-lg px-3 py-1.5 text-sm">
                    Approve
                  </button>
                </form>
                <form action={kfAdminModerateListingAction}>
                  <input type="hidden" name="listingId" value={row.id} />
                  <input type="hidden" name="decision" value="REJECTED" />
                  <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm">
                    Reject
                  </button>
                </form>
                <form action={kfAdminModerateListingAction}>
                  <input type="hidden" name="listingId" value={row.id} />
                  <input type="hidden" name="decision" value="DISABLED" />
                  <button type="submit" className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-800">
                    Disable
                  </button>
                </form>
                <Link
                  href={`/kasifind/provider/${row.id}`}
                  className="self-center text-sm underline"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold">Open reports ({reports.length})</h2>
        <ul className="mt-3 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="kf-card rounded-xl p-4 text-sm">
              <p className="font-medium">{r.listing?.displayName ?? "Unknown listing"}</p>
              <p>{r.reason}</p>
              {r.details && <p className="text-[var(--kf-muted)]">{r.details}</p>}
              <form action={kfAdminResolveReportAction} className="mt-2">
                <input type="hidden" name="reportId" value={r.id} />
                <button type="submit" className="text-xs underline">
                  Mark resolved
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--kf-muted)]">
        Bootstrap admins via <code>KASIFIND_ADMIN_EMAIL</code> and <code>KASIFIND_ADMIN_PASSWORD</code> on
        deploy (update password in Railway + redeploy). Separate from InstallBase admins.
      </p>
    </div>
  );
}

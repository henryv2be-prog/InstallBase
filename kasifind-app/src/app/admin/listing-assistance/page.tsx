import Link from "next/link";
import { KfAdminAssistanceQueue } from "@/components/kasifind/admin/kf-admin-assistance-queue";
import { KfAdminAssistanceWorkspace } from "@/components/kasifind/admin/kf-admin-assistance-workspace";
import { buildAdminAssistanceDetailHref } from "@/lib/kasifind/admin-assistance-nav";
import { loadAdminAssistanceWorkspace } from "@/lib/kasifind/admin-assistance-page-data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminListingAssistancePage({ searchParams }: Props) {
  const sp = await searchParams;
  const { summary, data, listParams } = await loadAdminAssistanceWorkspace(sp);

  const firstActionable =
    data.rows.find((r) => r.status === "PENDING" || r.status === "IN_PROGRESS") ?? data.rows[0];

  return (
    <KfAdminAssistanceWorkspace
      activeRequestId={null}
      queue={
        <KfAdminAssistanceQueue
          summary={summary}
          rows={data.rows}
          listParams={listParams}
          selectedId={null}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
        />
      }
    >
      <div className="kf-admin-assistance-placeholder">
        <p className="kf-admin-assistance-placeholder__title">Select a request</p>
        <p className="kf-admin-assistance-placeholder__body">
          Choose a provider from the queue to review photos, update status, and edit their listing.
        </p>
        {firstActionable ? (
          <Link
            href={buildAdminAssistanceDetailHref(firstActionable.id, listParams)}
            className="kf-btn kf-btn-primary text-sm"
          >
            Open {firstActionable.status === "PENDING" ? "next pending" : "first in list"}
          </Link>
        ) : null}
      </div>
    </KfAdminAssistanceWorkspace>
  );
}
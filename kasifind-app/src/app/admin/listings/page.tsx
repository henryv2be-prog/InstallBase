import Link from "next/link";
import { KfAdminListingsQueue } from "@/components/kasifind/admin/kf-admin-listings-queue";
import { KfAdminMasterDetailWorkspace } from "@/components/kasifind/admin/kf-admin-master-detail-workspace";
import { buildAdminListingsDetailHref } from "@/lib/kasifind/admin-listings-nav";
import { loadAdminListingsWorkspace } from "@/lib/kasifind/admin-listings-page-data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminListingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { data, listParams } = await loadAdminListingsWorkspace(sp);

  const firstPending =
    data.rows.find((r) => r.moderationStatus === "PENDING") ?? data.rows[0];

  return (
    <KfAdminMasterDetailWorkspace
      title="Listings"
      description="Browse, moderate, and edit listings without losing your place in the queue."
      activeId={null}
      queue={
        <KfAdminListingsQueue
          rows={data.rows}
          listParams={listParams}
          selectedId={null}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          exportHref="/admin/export/listings"
        />
      }
    >
      <div className="kf-admin-master-detail-placeholder">
        <p className="kf-admin-master-detail-placeholder__title">Select a listing</p>
        <p className="kf-admin-master-detail-placeholder__body">
          Open a business from the queue to review metrics, take moderation actions, or edit fields as an
          admin.
        </p>
        {firstPending ? (
          <Link
            href={buildAdminListingsDetailHref(firstPending.id, listParams)}
            className="kf-btn kf-btn-primary text-sm"
          >
            {firstPending.moderationStatus === "PENDING" ? "Open next pending" : "Open first in list"}
          </Link>
        ) : null}
      </div>
    </KfAdminMasterDetailWorkspace>
  );
}
import Link from "next/link";
import { KfAdminMasterDetailWorkspace } from "@/components/kasifind/admin/kf-admin-master-detail-workspace";
import { KfAdminModerationDetail } from "@/components/kasifind/admin/kf-admin-moderation-detail";
import { KfAdminModerationQueue } from "@/components/kasifind/admin/kf-admin-moderation-queue";
import { buildAdminModerationItemHref } from "@/lib/kasifind/admin-moderation-nav";
import { loadAdminModerationWorkspace } from "@/lib/kasifind/admin-moderation-page-data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminModerationPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { counts, queue, listParams, selectedId } = await loadAdminModerationWorkspace(sp);

  const first = queue.rows[0];

  return (
    <KfAdminMasterDetailWorkspace
      title="Moderation"
      description="Pending listings, user reports, and a read-only view of community reviews — in one workspace."
      activeId={selectedId}
      queue={
        <KfAdminModerationQueue
          tab={listParams.tab ?? "pending"}
          counts={counts}
          rows={queue.rows}
          listParams={listParams}
          selectedId={selectedId}
          total={queue.total}
          page={queue.page}
          pageSize={queue.pageSize}
        />
      }
    >
      {selectedId ? (
        <KfAdminModerationDetail tab={listParams.tab ?? "pending"} itemId={selectedId} />
      ) : (
        <div className="kf-admin-master-detail-placeholder">
          <p className="kf-admin-master-detail-placeholder__title">Select an item</p>
          <p className="kf-admin-master-detail-placeholder__body">
            Use the tabs to switch between approval queue, open reports, or browsing reviews. Open an
            item to act on it without leaving the queue.
          </p>
          {first ? (
            <Link
              href={buildAdminModerationItemHref(first.id, listParams)}
              className="kf-btn kf-btn-primary text-sm"
            >
              Open first in {listParams.tab === "reports" ? "reports" : listParams.tab === "reviews" ? "reviews" : "pending"}
            </Link>
          ) : null}
        </div>
      )}
    </KfAdminMasterDetailWorkspace>
  );
}
import Link from "next/link";
import { KfAdminMasterDetailWorkspace } from "@/components/kasifind/admin/kf-admin-master-detail-workspace";
import { KfAdminProvidersQueue } from "@/components/kasifind/admin/kf-admin-providers-queue";
import { buildAdminProvidersDetailHref } from "@/lib/kasifind/admin-providers-nav";
import { loadAdminProvidersWorkspace } from "@/lib/kasifind/admin-providers-page-data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { data, listParams } = await loadAdminProvidersWorkspace(sp);

  const first = data.rows[0];

  return (
    <KfAdminMasterDetailWorkspace
      title="Providers"
      description="Review accounts, manage roles, and jump to listings or assistance in context."
      activeId={null}
      queue={
        <KfAdminProvidersQueue
          rows={data.rows}
          listParams={listParams}
          selectedId={null}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          exportHref="/admin/export/users"
        />
      }
    >
      <div className="kf-admin-master-detail-placeholder">
        <p className="kf-admin-master-detail-placeholder__title">Select a provider</p>
        <p className="kf-admin-master-detail-placeholder__body">
          Choose an account to manage suspension, roles, and linked listing actions in one place.
        </p>
        {first ? (
          <Link
            href={buildAdminProvidersDetailHref(first.id, listParams)}
            className="kf-btn kf-btn-primary text-sm"
          >
            Open first in list
          </Link>
        ) : null}
      </div>
    </KfAdminMasterDetailWorkspace>
  );
}
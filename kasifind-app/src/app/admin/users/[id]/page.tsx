import { notFound } from "next/navigation";
import { KfAdminMasterDetailWorkspace } from "@/components/kasifind/admin/kf-admin-master-detail-workspace";
import { KfAdminProvidersDetail } from "@/components/kasifind/admin/kf-admin-providers-detail";
import { KfAdminProvidersQueue } from "@/components/kasifind/admin/kf-admin-providers-queue";
import { buildAdminProvidersIndexHref } from "@/lib/kasifind/admin-providers-nav";
import { getAdminUserDetail } from "@/lib/kasifind/admin-users";
import { loadAdminProvidersWorkspace } from "@/lib/kasifind/admin-providers-page-data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUserDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [workspace, user] = await Promise.all([loadAdminProvidersWorkspace(sp), getAdminUserDetail(id)]);

  if (!user) notFound();

  const { data, listParams } = workspace;

  return (
    <KfAdminMasterDetailWorkspace
      title="Providers"
      description="Review accounts, manage roles, and jump to listings or assistance in context."
      activeId={id}
      mobileBackHref={buildAdminProvidersIndexHref(listParams)}
      queue={
        <KfAdminProvidersQueue
          rows={data.rows}
          listParams={listParams}
          selectedId={id}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          exportHref="/admin/export/users"
        />
      }
    >
      <KfAdminProvidersDetail user={user} />
    </KfAdminMasterDetailWorkspace>
  );
}
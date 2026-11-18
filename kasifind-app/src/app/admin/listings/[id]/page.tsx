import { notFound } from "next/navigation";
import { KfAdminListingsDetail } from "@/components/kasifind/admin/kf-admin-listings-detail";
import { KfAdminListingsQueue } from "@/components/kasifind/admin/kf-admin-listings-queue";
import { KfAdminMasterDetailWorkspace } from "@/components/kasifind/admin/kf-admin-master-detail-workspace";
import { getAdminListingDetail } from "@/lib/kasifind/admin-listings";
import { loadAdminListingsWorkspace } from "@/lib/kasifind/admin-listings-page-data";
import { listKfCategories } from "@/lib/kasifind/categories";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminListingDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [workspace, detail, categories] = await Promise.all([
    loadAdminListingsWorkspace(sp),
    getAdminListingDetail(id),
    listKfCategories(),
  ]);

  if (!detail) notFound();

  const { data, listParams } = workspace;

  return (
    <KfAdminMasterDetailWorkspace
      title="Listings"
      description="Browse, moderate, and edit listings without losing your place in the queue."
      activeId={id}
      queue={
        <KfAdminListingsQueue
          rows={data.rows}
          listParams={listParams}
          selectedId={id}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          exportHref="/admin/export/listings"
        />
      }
    >
      <KfAdminListingsDetail data={detail} categories={categories} />
    </KfAdminMasterDetailWorkspace>
  );
}
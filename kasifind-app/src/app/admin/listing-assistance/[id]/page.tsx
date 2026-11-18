import { notFound } from "next/navigation";
import { KfAdminAssistanceDetail } from "@/components/kasifind/admin/kf-admin-assistance-detail";
import { KfAdminAssistanceQueue } from "@/components/kasifind/admin/kf-admin-assistance-queue";
import { KfAdminAssistanceWorkspace } from "@/components/kasifind/admin/kf-admin-assistance-workspace";
import { loadAdminAssistanceWorkspace } from "@/lib/kasifind/admin-assistance-page-data";
import { listKfCategories } from "@/lib/kasifind/categories";
import { getAdminAssistanceRequestDetail } from "@/lib/kasifind/listing-assistance";
import { getAssistanceListingImagesBundle } from "@/lib/kasifind/listing-assistance-images";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminListingAssistanceDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const [workspace, request, categories, imageBundle] = await Promise.all([
    loadAdminAssistanceWorkspace(sp),
    getAdminAssistanceRequestDetail(id),
    listKfCategories(),
    getAssistanceListingImagesBundle(id),
  ]);

  if (!request) notFound();

  const { summary, data, listParams } = workspace;
  const images = (imageBundle?.images ?? []).map((img) => ({
    imageKey: img.imageKey,
    label: img.label,
    url: img.url,
  }));

  return (
    <KfAdminAssistanceWorkspace
      activeRequestId={id}
      queue={
        <KfAdminAssistanceQueue
          summary={summary}
          rows={data.rows}
          listParams={listParams}
          selectedId={id}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
        />
      }
    >
      <KfAdminAssistanceDetail request={request} categories={categories} images={images} />
    </KfAdminAssistanceWorkspace>
  );
}
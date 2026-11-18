import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";

export type AdminAssistanceListParams = {
  status?: KfListingAssistanceStatus | "";
  page?: number;
};

export function buildAdminAssistanceListQuery(
  params: AdminAssistanceListParams,
  overrides: Record<string, string> = {}
): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v) search.set(k, v);
    else search.delete(k);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function buildAdminAssistanceDetailHref(
  requestId: string,
  params: AdminAssistanceListParams
): string {
  return `/admin/listing-assistance/${requestId}${buildAdminAssistanceListQuery(params)}`;
}

export function buildAdminAssistanceIndexHref(params: AdminAssistanceListParams): string {
  return `/admin/listing-assistance${buildAdminAssistanceListQuery(params)}`;
}

export const ADMIN_ASSISTANCE_STATUS_FILTERS: {
  value: KfListingAssistanceStatus | "";
  label: string;
}[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
];

export function adminAssistanceStatusLabel(status: KfListingAssistanceStatus): string {
  return ADMIN_ASSISTANCE_STATUS_FILTERS.find((f) => f.value === status)?.label ?? status;
}
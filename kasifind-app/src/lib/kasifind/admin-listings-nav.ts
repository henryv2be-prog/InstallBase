import type { KfListingStatus, KfModerationStatus } from "@/generated/prisma/enums";

export type AdminListingsListParams = {
  q?: string;
  status?: KfListingStatus | "";
  moderation?: KfModerationStatus | "";
  page?: number;
};

export function buildAdminListingsListQuery(
  params: AdminListingsListParams,
  overrides: Record<string, string> = {}
): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.moderation) search.set("moderation", params.moderation);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v) search.set(k, v);
    else search.delete(k);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function buildAdminListingsDetailHref(
  listingId: string,
  params: AdminListingsListParams
): string {
  return `/admin/listings/${listingId}${buildAdminListingsListQuery(params)}`;
}

export function buildAdminListingsIndexHref(params: AdminListingsListParams): string {
  return `/admin/listings${buildAdminListingsListQuery(params)}`;
}
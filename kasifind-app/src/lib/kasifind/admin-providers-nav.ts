import type { KfUserRole } from "@/generated/prisma/enums";

export type AdminProvidersListParams = {
  q?: string;
  role?: KfUserRole | "";
  suspended?: "" | "true" | "false";
  page?: number;
};

export function buildAdminProvidersListQuery(
  params: AdminProvidersListParams,
  overrides: Record<string, string> = {}
): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  if (params.suspended) search.set("suspended", params.suspended);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v) search.set(k, v);
    else search.delete(k);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function buildAdminProvidersDetailHref(
  userId: string,
  params: AdminProvidersListParams
): string {
  return `/admin/users/${userId}${buildAdminProvidersListQuery(params)}`;
}

export function buildAdminProvidersIndexHref(params: AdminProvidersListParams): string {
  return `/admin/users${buildAdminProvidersListQuery(params)}`;
}
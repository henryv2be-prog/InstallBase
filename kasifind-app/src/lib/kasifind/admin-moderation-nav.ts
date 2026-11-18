export type AdminModerationTab = "pending" | "reports" | "reviews";

export type AdminModerationListParams = {
  tab?: AdminModerationTab;
  page?: number;
  q?: string;
};

export function buildAdminModerationListQuery(
  params: AdminModerationListParams,
  overrides: Record<string, string> = {}
): string {
  const search = new URLSearchParams();
  if (params.tab && params.tab !== "pending") search.set("tab", params.tab);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v) search.set(k, v);
    else search.delete(k);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function buildAdminModerationIndexHref(params: AdminModerationListParams): string {
  return `/admin/reports${buildAdminModerationListQuery(params)}`;
}

export function buildAdminModerationItemHref(
  itemId: string,
  params: AdminModerationListParams
): string {
  const search = new URLSearchParams(buildAdminModerationListQuery(params).replace(/^\?/, ""));
  search.set("id", itemId);
  const s = search.toString();
  return `/admin/reports${s ? `?${s}` : ""}`;
}
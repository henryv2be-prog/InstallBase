import "server-only";
import type { KfListingStatus, KfModerationStatus } from "@/generated/prisma/enums";
import type { AdminListingsListParams } from "@/lib/kasifind/admin-listings-nav";
import { getAdminListingsPage } from "@/lib/kasifind/admin-listings";

const STATUSES = new Set<KfListingStatus>(["DRAFT", "PUBLISHED", "DISABLED"]);
const MODERATION = new Set<KfModerationStatus>(["PENDING", "APPROVED", "REJECTED"]);

export function parseAdminListingsSearchParams(
  sp: Record<string, string | string[] | undefined>
): AdminListingsListParams & { page: number } {
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const statusRaw = typeof sp.status === "string" ? sp.status : "";
  const moderationRaw = typeof sp.moderation === "string" ? sp.moderation : "";
  const status = STATUSES.has(statusRaw as KfListingStatus) ? (statusRaw as KfListingStatus) : "";
  const moderation = MODERATION.has(moderationRaw as KfModerationStatus)
    ? (moderationRaw as KfModerationStatus)
    : "";
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  return {
    q,
    status,
    moderation,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function loadAdminListingsWorkspace(sp: Record<string, string | string[] | undefined>) {
  const { q, status, moderation, page } = parseAdminListingsSearchParams(sp);
  const data = await getAdminListingsPage({ q, status, moderation, page, pageSize: 30 });
  return {
    data,
    listParams: { q, status, moderation, page },
  };
}
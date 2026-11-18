import "server-only";
import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";
import type { AdminAssistanceListParams } from "@/lib/kasifind/admin-assistance-nav";
import {
  getAdminAssistanceRequests,
  getAdminAssistanceSummary,
} from "@/lib/kasifind/listing-assistance";

const ASSISTANCE_STATUSES = new Set<KfListingAssistanceStatus>([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "DECLINED",
]);

function parseAssistanceStatus(raw: string | undefined): KfListingAssistanceStatus | "" {
  if (!raw) return "";
  return ASSISTANCE_STATUSES.has(raw as KfListingAssistanceStatus)
    ? (raw as KfListingAssistanceStatus)
    : "";
}

export function parseAdminAssistanceSearchParams(
  sp: Record<string, string | string[] | undefined>
): AdminAssistanceListParams & { page: number } {
  const status =
    typeof sp.status === "string" ? parseAssistanceStatus(sp.status) : ("" as const);
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  return {
    status,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function loadAdminAssistanceWorkspace(sp: Record<string, string | string[] | undefined>) {
  const { status, page } = parseAdminAssistanceSearchParams(sp);
  const [summary, data] = await Promise.all([
    getAdminAssistanceSummary(),
    getAdminAssistanceRequests({ status, page, pageSize: 30 }),
  ]);

  return {
    summary,
    data,
    listParams: { status, page },
  };
}
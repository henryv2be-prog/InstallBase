import "server-only";
import type { KfUserRole } from "@/generated/prisma/enums";
import type { AdminProvidersListParams } from "@/lib/kasifind/admin-providers-nav";
import { getAdminUsersPage } from "@/lib/kasifind/admin-users";

const ROLES = new Set<KfUserRole>(["PROVIDER", "ADMIN"]);

export function parseAdminProvidersSearchParams(
  sp: Record<string, string | string[] | undefined>
): AdminProvidersListParams & { page: number } {
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const roleRaw = typeof sp.role === "string" ? sp.role : "";
  const role = ROLES.has(roleRaw as KfUserRole) ? (roleRaw as KfUserRole) : "";
  const suspendedRaw = typeof sp.suspended === "string" ? sp.suspended : "";
  const suspended =
    suspendedRaw === "true" || suspendedRaw === "false" ? suspendedRaw : ("" as const);
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  return {
    q,
    role,
    suspended,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function loadAdminProvidersWorkspace(sp: Record<string, string | string[] | undefined>) {
  const { q, role, suspended, page } = parseAdminProvidersSearchParams(sp);
  const data = await getAdminUsersPage({ q, role, suspended, page, pageSize: 30 });
  return {
    data,
    listParams: { q, role, suspended, page },
  };
}
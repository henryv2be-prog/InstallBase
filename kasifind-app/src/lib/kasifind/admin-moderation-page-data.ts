import "server-only";
import type { AdminModerationListParams, AdminModerationTab } from "@/lib/kasifind/admin-moderation-nav";
import {
  getAdminModerationTabCounts,
  loadAdminModerationQueue,
  parseModerationTab,
} from "@/lib/kasifind/admin-moderation";

export function parseAdminModerationSearchParams(
  sp: Record<string, string | string[] | undefined>
): AdminModerationListParams & { page: number; tab: AdminModerationTab; id: string | null } {
  const tab = parseModerationTab(typeof sp.tab === "string" ? sp.tab : undefined);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = typeof sp.page === "string" ? Number.parseInt(sp.page, 10) : 1;
  const id = typeof sp.id === "string" ? sp.id : null;
  return {
    tab,
    q,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    id,
  };
}

export async function loadAdminModerationWorkspace(sp: Record<string, string | string[] | undefined>) {
  const { tab, q, page, id } = parseAdminModerationSearchParams(sp);
  const [counts, queue] = await Promise.all([
    getAdminModerationTabCounts(),
    loadAdminModerationQueue(tab, { page, q }),
  ]);

  return {
    counts,
    queue,
    listParams: { tab, q: q || undefined, page },
    selectedId: id,
  };
}
import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  adminAuditActionKind,
  formatAdminAuditActionLabel,
} from "@/lib/kasifind/admin-audit-labels";

export type AdminAuditFeedRow = {
  id: string;
  action: string;
  actionLabel: string;
  detail: string | null;
  targetId: string | null;
  targetLabel: string | null;
  href: string | null;
  adminName: string;
  adminEmail: string;
  createdAt: string;
};

function resolveAuditHref(
  action: string,
  targetId: string | null,
  listingIdByReport: Map<string, string | null>
): string | null {
  if (!targetId) return null;
  const kind = adminAuditActionKind(action);
  if (kind === "listing") return `/admin/listings/${targetId}`;
  if (kind === "report") {
    const listingId = listingIdByReport.get(targetId);
    if (listingId) return `/admin/listings/${listingId}`;
    return "/admin/reports";
  }
  if (kind === "category") return "/admin/categories";
  if (kind === "user") return "/admin/users";
  return null;
}

export async function getAdminAuditFeed(limit = 18): Promise<AdminAuditFeedRow[]> {
  const kf = getKasiFindPrisma();
  const take = Math.min(50, Math.max(1, limit));
  const rows = await kf.kfAdminAudit.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
  if (rows.length === 0) return [];

  const adminIds = [...new Set(rows.map((r) => r.adminId))];
  const listingTargetIds = rows
    .filter((r) => r.targetId && adminAuditActionKind(r.action) === "listing")
    .map((r) => r.targetId!);
  const reportTargetIds = rows
    .filter((r) => r.targetId && adminAuditActionKind(r.action) === "report")
    .map((r) => r.targetId!);

  const [admins, reports] = await Promise.all([
    kf.kfUser.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, name: true, email: true },
    }),
    reportTargetIds.length
      ? kf.kfReport.findMany({
          where: { id: { in: reportTargetIds } },
          select: { id: true, listingId: true },
        })
      : Promise.resolve([]),
  ]);

  const listingIdByReport = new Map(reports.map((r) => [r.id, r.listingId]));
  const listingIdsToResolve = [
    ...new Set([
      ...listingTargetIds,
      ...reports.map((r) => r.listingId).filter((id): id is string => Boolean(id)),
    ]),
  ];
  const listings = listingIdsToResolve.length
    ? await kf.kfProviderListing.findMany({
        where: { id: { in: listingIdsToResolve } },
        select: { id: true, displayName: true },
      })
    : [];

  const adminById = new Map(admins.map((a) => [a.id, a]));
  const listingNameById = new Map(listings.map((l) => [l.id, l.displayName]));

  return rows.map((row) => {
    const admin = adminById.get(row.adminId);
    const kind = adminAuditActionKind(row.action);
    let targetLabel: string | null = null;
    if (row.targetId) {
      if (kind === "listing") {
        targetLabel = listingNameById.get(row.targetId) ?? "Listing removed";
      } else       if (kind === "report") {
        const listingId = listingIdByReport.get(row.targetId) ?? null;
        targetLabel = listingId
          ? (listingNameById.get(listingId) ?? "Reported listing")
          : "User report";
      } else if (kind === "user") {
        targetLabel = "User account";
      } else if (kind === "category") {
        targetLabel = "Category";
      }
    }

    return {
      id: row.id,
      action: row.action,
      actionLabel: formatAdminAuditActionLabel(row.action),
      detail: row.detail,
      targetId: row.targetId,
      targetLabel,
      href: resolveAuditHref(row.action, row.targetId, listingIdByReport),
      adminName: admin?.name?.trim() || admin?.email || "Admin",
      adminEmail: admin?.email ?? "—",
      createdAt: row.createdAt.toISOString(),
    };
  });
}

export type AdminInboxCompletedItem = {
  id: string;
  kind: "assistance" | "audit";
  title: string;
  subtitle: string | null;
  href: string | null;
  createdAt: string;
};

/** Recently finished operational work (assistance + selective audit actions). */
export async function getAdminInboxRecentlyCompleted(limit = 8): Promise<AdminInboxCompletedItem[]> {
  const kf = getKasiFindPrisma();
  const [assistanceDone, auditDone] = await Promise.all([
    kf.kfListingAssistanceRequest.findMany({
      where: { status: "COMPLETED", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: limit,
      include: {
        listing: { select: { id: true, displayName: true } },
      },
    }),
    kf.kfAdminAudit.findMany({
      where: {
        action: { in: ["listing.approved", "report.resolved", "listing.rejected"] },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  const listingIds = auditDone
    .filter((a) => a.targetId && a.action.startsWith("listing."))
    .map((a) => a.targetId!);
  const reportIds = auditDone
    .filter((a) => a.targetId && a.action === "report.resolved")
    .map((a) => a.targetId!);

  const [listings, reports] = await Promise.all([
    listingIds.length
      ? kf.kfProviderListing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, displayName: true },
        })
      : Promise.resolve([]),
    reportIds.length
      ? kf.kfReport.findMany({
          where: { id: { in: reportIds } },
          select: { id: true, listingId: true },
        })
      : Promise.resolve([]),
  ]);
  const listingNameById = new Map(listings.map((l) => [l.id, l.displayName]));
  const reportListingId = new Map(reports.map((r) => [r.id, r.listingId]));

  const fromAssistance: AdminInboxCompletedItem[] = assistanceDone.map((r) => ({
    id: `assist-${r.id}`,
    kind: "assistance",
    title: `Assistance completed — ${r.listing.displayName}`,
    subtitle: null,
    href: `/admin/listing-assistance/${r.id}`,
    createdAt: (r.completedAt ?? r.updatedAt).toISOString(),
  }));

  const fromAudit: AdminInboxCompletedItem[] = auditDone.map((a) => {
    const label = formatAdminAuditActionLabel(a.action);
    let href: string | null = null;
    let subtitle: string | null = null;
    if (a.targetId && a.action.startsWith("listing.")) {
      href = `/admin/listings/${a.targetId}`;
      subtitle = listingNameById.get(a.targetId) ?? null;
    } else if (a.targetId && a.action === "report.resolved") {
      const listingId = reportListingId.get(a.targetId);
      href = listingId ? `/admin/listings/${listingId}` : "/admin/reports";
      subtitle = listingId ? listingNameById.get(listingId) ?? null : null;
    }
    return {
      id: `audit-${a.id}`,
      kind: "audit",
      title: label,
      subtitle,
      href,
      createdAt: a.createdAt.toISOString(),
    };
  });

  return [...fromAssistance, ...fromAudit]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}
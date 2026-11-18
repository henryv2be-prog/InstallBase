import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import type { AdminModerationTab } from "@/lib/kasifind/admin-moderation-nav";

const TABS = new Set<AdminModerationTab>(["pending", "reports", "reviews"]);

export function parseModerationTab(raw: string | undefined): AdminModerationTab {
  if (raw && TABS.has(raw as AdminModerationTab)) return raw as AdminModerationTab;
  return "pending";
}

export async function getAdminModerationTabCounts() {
  const kf = getKasiFindPrisma();
  const [pendingModeration, openReports, visibleReviews] = await Promise.all([
    kf.kfProviderListing.count({
      where: { moderationStatus: "PENDING", status: { in: ["PUBLISHED", "DRAFT"] } },
    }),
    kf.kfReport.count({ where: { resolved: false } }),
    kf.kfReview.count({ where: { hidden: false } }),
  ]);
  return { pendingModeration, openReports, visibleReviews };
}

export async function getAdminModerationPendingPage(options: { page?: number; pageSize?: number }) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 30));
  const skip = (page - 1) * pageSize;
  const where = {
    moderationStatus: "PENDING" as const,
    status: { in: ["PUBLISHED", "DRAFT"] as ("PUBLISHED" | "DRAFT")[] },
  };

  const [total, rows] = await Promise.all([
    kf.kfProviderListing.count({ where }),
    kf.kfProviderListing.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((r) => ({
      id: r.id,
      kind: "pending" as const,
      title: r.displayName,
      subtitle: r.user.email,
      meta: `${r.status} · ${r.locationLabel}`,
      excerpt: r.description.slice(0, 160),
      updatedAt: r.updatedAt.toISOString(),
    })),
  };
}

export async function getAdminModerationReportsPage(options: { page?: number; pageSize?: number }) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 30));
  const skip = (page - 1) * pageSize;
  const where = { resolved: false };

  const [total, rows] = await Promise.all([
    kf.kfReport.count({ where }),
    kf.kfReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        listing: { select: { id: true, displayName: true } },
        reporter: { select: { email: true, name: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((r) => ({
      id: r.id,
      kind: "report" as const,
      title: r.listing?.displayName ?? "Unknown listing",
      subtitle: r.reason,
      meta: r.reporter?.email ?? "Anonymous report",
      excerpt: r.details?.slice(0, 140) ?? "",
      createdAt: r.createdAt.toISOString(),
      listingId: r.listing?.id ?? null,
    })),
  };
}

export async function getAdminModerationReviewsPage(options: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 30));
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (options.q?.trim()) {
    const q = options.q.trim();
    where.OR = [
      { body: { contains: q, mode: "insensitive" } },
      { authorName: { contains: q, mode: "insensitive" } },
      { listing: { displayName: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, rows] = await Promise.all([
    kf.kfReview.count({ where }),
    kf.kfReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        listing: { select: { id: true, displayName: true } },
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((r) => ({
      id: r.id,
      kind: "review" as const,
      title: r.listing.displayName,
      subtitle: `${r.rating}★ · ${r.authorName ?? r.user?.name ?? "Visitor"}`,
      meta: r.hidden ? "Hidden" : r.verified ? "Verified" : "Public",
      excerpt: r.body.slice(0, 140),
      createdAt: r.createdAt.toISOString(),
      listingId: r.listing.id,
    })),
  };
}

export async function getAdminModerationPendingDetail(listingId: string) {
  const kf = getKasiFindPrisma();
  return kf.kfProviderListing.findUnique({
    where: { id: listingId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      categories: { include: { category: { select: { name: true } } } },
      _count: { select: { reviews: true, reports: true } },
    },
  });
}

export async function getAdminModerationReportDetail(reportId: string) {
  const kf = getKasiFindPrisma();
  return kf.kfReport.findUnique({
    where: { id: reportId },
    include: {
      listing: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
      reporter: { select: { email: true, name: true } },
    },
  });
}

export async function getAdminModerationReviewDetail(reviewId: string) {
  const kf = getKasiFindPrisma();
  return kf.kfReview.findUnique({
    where: { id: reviewId },
    include: {
      listing: { select: { id: true, displayName: true, status: true, moderationStatus: true } },
      user: { select: { email: true, name: true } },
    },
  });
}

export async function loadAdminModerationQueue(
  tab: AdminModerationTab,
  options: { page: number; q?: string }
) {
  if (tab === "reports") return getAdminModerationReportsPage({ page: options.page, pageSize: 30 });
  if (tab === "reviews") {
    return getAdminModerationReviewsPage({ page: options.page, pageSize: 30, q: options.q });
  }
  return getAdminModerationPendingPage({ page: options.page, pageSize: 30 });
}
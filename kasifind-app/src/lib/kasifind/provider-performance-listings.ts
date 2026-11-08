import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import type { ProviderReportListingRow } from "@/lib/kasifind/provider-performance-report-types";

export type { ProviderReportListingRow } from "@/lib/kasifind/provider-performance-report-types";

export async function getProviderReportListingsPage(options: {
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<{
  total: number;
  page: number;
  pageSize: number;
  rows: ProviderReportListingRow[];
}> {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, options.pageSize ?? 30));
  const skip = (page - 1) * pageSize;

  const term = options.q?.trim();
  const where = term
    ? { displayName: { contains: term, mode: "insensitive" as const } }
    : {};

  const [total, rows] = await Promise.all([
    kf.kfProviderListing.count({ where }),
    kf.kfProviderListing.findMany({
      where,
      orderBy: { displayName: "asc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        displayName: true,
        status: true,
        moderationStatus: true,
        phone: true,
        whatsapp: true,
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((r) => ({
      id: r.id,
      displayName: r.displayName,
      status: r.status,
      moderationStatus: r.moderationStatus,
      phone: r.phone,
      whatsapp: r.whatsapp,
    })),
  };
}

export async function getProviderListingWhatsAppPhone(listingId: string): Promise<string | null> {
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({
    where: { id: listingId },
    select: { phone: true, whatsapp: true },
  });
  if (!listing) return null;
  const preferred = listing.whatsapp?.trim() || listing.phone.trim();
  return preferred || null;
}

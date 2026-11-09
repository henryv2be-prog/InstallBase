import "server-only";
import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { providerVisibleAssistanceStatusLabel } from "@/lib/kasifind/listing-assistance-status";

export type ProviderAssistanceRequestView = {
  id: string;
  status: KfListingAssistanceStatus;
  statusLabel: string;
  providerMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export async function getProviderListingAssistanceRequest(
  userId: string
): Promise<ProviderAssistanceRequestView | null> {
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!listing) return null;

  const latest = await kf.kfListingAssistanceRequest.findFirst({
    where: { listingId: listing.id, userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return null;

  return {
    id: latest.id,
    status: latest.status,
    statusLabel: providerVisibleAssistanceStatusLabel(latest.status),
    providerMessage: latest.providerMessage,
    createdAt: latest.createdAt.toISOString(),
    completedAt: latest.completedAt?.toISOString() ?? null,
  };
}

export async function getAdminAssistanceSummary() {
  const kf = getKasiFindPrisma();
  const [pending, inProgress, completed] = await Promise.all([
    kf.kfListingAssistanceRequest.count({ where: { status: "PENDING" } }),
    kf.kfListingAssistanceRequest.count({ where: { status: "IN_PROGRESS" } }),
    kf.kfListingAssistanceRequest.count({ where: { status: "COMPLETED" } }),
  ]);
  return { pending, inProgress, completed };
}

export async function getAdminAssistanceRequests(options: {
  status?: KfListingAssistanceStatus | "" | undefined;
  page?: number;
  pageSize?: number;
}) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, options.pageSize ?? 25));
  const skip = (page - 1) * pageSize;

  const filterStatus = options.status;
  const where =
    filterStatus && filterStatus.length > 0
      ? { status: filterStatus }
      : {};

  const [total, rows] = await Promise.all([
    kf.kfListingAssistanceRequest.count({ where }),
    kf.kfListingAssistanceRequest.findMany({
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
      listingId: r.listingId,
      businessName: r.listing.displayName,
      providerEmail: r.user.email,
      providerName: r.user.name,
      providerMessage: r.providerMessage,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
    })),
  };
}

export async function getAdminAssistanceRequestDetail(requestId: string) {
  const kf = getKasiFindPrisma();
  const request = await kf.kfListingAssistanceRequest.findUnique({
    where: { id: requestId },
    include: {
      listing: {
        include: {
          categories: { include: { category: true } },
          services: true,
          photos: { orderBy: { sortOrder: "asc" } },
          user: { select: { email: true, name: true, id: true } },
        },
      },
      statusEvents: {
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { email: true, name: true } } },
      },
      auditEntries: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  return request;
}

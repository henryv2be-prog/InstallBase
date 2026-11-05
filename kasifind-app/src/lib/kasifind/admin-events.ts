import "server-only";
import type { KfAnalyticsEventType } from "@/generated/prisma/enums";
import { KfAnalyticsEventType as EventTypes } from "@/generated/prisma/enums";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

const VALID_EVENT_TYPES = new Set<string>(Object.values(EventTypes));

export function isAnalyticsEventType(value: string): value is KfAnalyticsEventType {
  return VALID_EVENT_TYPES.has(value);
}

export async function getAdminEventsPage(options: {
  q?: string;
  eventType?: string;
  page?: number;
  pageSize?: number;
}) {
  const kf = getKasiFindPrisma();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, options.pageSize ?? 50));
  const skip = (page - 1) * pageSize;

  const and: Record<string, unknown>[] = [];

  if (options.eventType && isAnalyticsEventType(options.eventType)) {
    and.push({ eventType: options.eventType });
  }

  const text = options.q?.trim();
  if (text) {
    and.push({
      OR: [
        { visitorId: { contains: text, mode: "insensitive" } },
        { query: { contains: text, mode: "insensitive" } },
        { regionLabel: { contains: text, mode: "insensitive" } },
        { listingId: { contains: text, mode: "insensitive" } },
        { categoryId: { contains: text, mode: "insensitive" } },
        { listing: { displayName: { contains: text, mode: "insensitive" } } },
        { user: { email: { contains: text, mode: "insensitive" } } },
        { user: { name: { contains: text, mode: "insensitive" } } },
        { category: { name: { contains: text, mode: "insensitive" } } },
      ],
    });
  }

  const where = and.length > 0 ? { AND: and } : {};

  const [total, rows] = await Promise.all([
    kf.kfAnalyticsEvent.count({ where }),
    kf.kfAnalyticsEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        listing: { select: { id: true, displayName: true } },
        user: { select: { id: true, email: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      createdAt: e.createdAt.toISOString(),
      listingId: e.listingId,
      listingName: e.listing?.displayName ?? null,
      categoryId: e.categoryId,
      categoryName: e.category?.name ?? null,
      userId: e.userId,
      userEmail: e.user?.email ?? null,
      userName: e.user?.name ?? null,
      visitorId: e.visitorId,
      query: e.query,
      regionLabel: e.regionLabel,
    })),
  };
}

export type AdminEventsPage = Awaited<ReturnType<typeof getAdminEventsPage>>;

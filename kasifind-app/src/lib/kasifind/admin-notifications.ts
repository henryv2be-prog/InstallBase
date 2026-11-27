import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getAdminUnreadNotificationCount(adminId: string): Promise<number> {
  const kf = getKasiFindPrisma();
  return kf.kfAdminNotification.count({
    where: { adminId, readAt: null },
  });
}

export type AdminNotificationListItem = {
  id: string;
  title: string;
  body: string;
  deepLink: string;
  category: string;
  priority: string;
  readAt: Date | null;
  createdAt: Date;
  eventType: string;
};

export async function listAdminNotifications(options: {
  adminId: string;
  unreadOnly?: boolean;
  category?: string;
  priority?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ items: AdminNotificationListItem[]; nextCursor: string | null }> {
  const kf = getKasiFindPrisma();
  const take = Math.min(50, Math.max(1, options.limit ?? 30));

  const rows = await kf.kfAdminNotification.findMany({
    where: {
      adminId: options.adminId,
      ...(options.unreadOnly ? { readAt: null } : {}),
      ...(options.category ? { category: options.category } : {}),
      ...(options.priority ? { priority: options.priority as never } : {}),
      ...(options.cursor ? { createdAt: { lt: new Date(options.cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    include: { event: { select: { eventType: true } } },
  });

  const page = rows.slice(0, take);
  const nextCursor =
    rows.length > take ? page[page.length - 1]!.createdAt.toISOString() : null;

  return {
    items: page.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      deepLink: n.deepLink,
      category: n.category,
      priority: n.priority,
      readAt: n.readAt,
      createdAt: n.createdAt,
      eventType: n.event.eventType,
    })),
    nextCursor,
  };
}

export async function markAdminNotificationRead(adminId: string, notificationId: string) {
  const kf = getKasiFindPrisma();
  await kf.kfAdminNotification.updateMany({
    where: { id: notificationId, adminId },
    data: { readAt: new Date() },
  });
}

export async function markAllAdminNotificationsRead(adminId: string) {
  const kf = getKasiFindPrisma();
  await kf.kfAdminNotification.updateMany({
    where: { adminId, readAt: null },
    data: { readAt: new Date() },
  });
}
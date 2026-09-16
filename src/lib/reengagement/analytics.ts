import "server-only";
import { prisma } from "@/lib/prisma";

const OPEN_EVENT_PAGE_KEY = "daily_reengagement_open";

export async function recordReengagementOpen(input: {
  userId: string;
  notificationId?: string;
}) {
  await prisma.pageViewEvent.create({
    data: {
      pageKey: OPEN_EVENT_PAGE_KEY,
      viewerKey: input.userId.slice(0, 64),
      deviceType: input.notificationId?.slice(0, 32),
    },
  });
}

export async function countReengagementSent(since?: Date): Promise<number> {
  return prisma.notification.count({
    where: {
      type: "DAILY_REENGAGEMENT",
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });
}

export async function countReengagementOpens(since?: Date): Promise<number> {
  return prisma.pageViewEvent.count({
    where: {
      pageKey: OPEN_EVENT_PAGE_KEY,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });
}

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export function revalidateActivityPaths() {
  revalidatePath("/activity");
  revalidatePath("/notifications");
  revalidatePath("/messages");
  revalidatePath("/feed", "layout");
}

export async function markNotificationsReadForUser(
  userId: string,
  filter: { id?: string; link?: string }
) {
  if (!filter.id && !filter.link) return;

  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
      ...(filter.id ? { id: filter.id } : {}),
      ...(filter.link ? { link: filter.link } : {}),
    },
    data: { read: true },
  });
}

export async function markConversationMessagesRead(conversationId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      read: false,
    },
    data: { read: true },
  });
  await markNotificationsReadForUser(userId, { link: `/messages/${conversationId}` });
}

import type { NotificationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

export async function notifyUser(input: {
  userId: string;
  actorId?: string;
  type: NotificationType;
  message: string;
  link?: string;
  pushTitle?: string;
  pushBody?: string;
}) {
  if (input.actorId && input.actorId === input.userId) return;

  await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      message: input.message,
      link: input.link,
    },
  });

  const actor = input.actorId
    ? await prisma.user.findUnique({
        where: { id: input.actorId },
        select: { name: true },
      })
    : null;

  const actorName = actor?.name ?? "Someone";
  await sendPushToUser(input.userId, {
    title: input.pushTitle ?? "InstallBase",
    body: input.pushBody ?? `${actorName} ${input.message}`,
    url: input.link ?? "/notifications",
    urgency: input.type === "MESSAGE" ? "high" : "normal",
  }).catch((error) => {
    console.error("Push send failed:", error);
  });
}

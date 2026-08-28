import webpush from "web-push";
import { prisma } from "@/lib/prisma";

function vapidConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function vapidSubject() {
  const raw = process.env.VAPID_SUBJECT?.trim() || "mailto:hello@installbase.io";
  if (/^(mailto|https):/i.test(raw)) return raw;
  if (raw.includes("@")) return `mailto:${raw}`;
  return `https://${raw}`;
}

function configureVapid() {
  if (!vapidConfigured()) return false;
  webpush.setVapidDetails(
    vapidSubject(),
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return true;
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!configureVapid()) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/notifications",
    icon: "/icons/192",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
        }
      }
    })
  );
}

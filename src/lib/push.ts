import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { getVapidPrivateKey, getVapidPublicKey, getVapidSubject, isPushConfigured } from "@/lib/vapid";

function configureVapid() {
  if (!isPushConfigured()) return false;
  try {
    webpush.setVapidDetails(getVapidSubject(), getVapidPublicKey(), getVapidPrivateKey());
    return true;
  } catch (error) {
    console.error("Invalid VAPID configuration:", error);
    return false;
  }
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string; urgency?: "normal" | "high" }
) {
  if (!configureVapid()) return 0;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return 0;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/notifications",
    icon: "/icons/192",
  });

  const results = await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          {
            TTL: 60 * 60 * 24,
            urgency: payload.urgency ?? "normal",
            timeout: 10_000,
          }
        );
        return true;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
          return false;
        }
        console.error("Web Push delivery failed:", status ?? "", (error as Error).message);
        return false;
      }
    })
  );

  return results.filter(Boolean).length;
}

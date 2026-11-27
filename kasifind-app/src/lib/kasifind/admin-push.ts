import "server-only";
import webpush from "web-push";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export type VapidPublicConfig = { publicKey: string; configured: boolean };

export function getVapidPublicConfig(): VapidPublicConfig {
  const publicKey = process.env.KASIFIND_VAPID_PUBLIC_KEY?.trim() ?? "";
  const privateKey = process.env.KASIFIND_VAPID_PRIVATE_KEY?.trim() ?? "";
  const subject =
    process.env.KASIFIND_VAPID_SUBJECT?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "mailto:admin@kasifind.com";
  const configured = Boolean(publicKey && privateKey);
  if (configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  }
  return { publicKey, configured };
}

export function isAdminPushConfigured(): boolean {
  return getVapidPublicConfig().configured;
}

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
  urgency?: "very-low" | "low" | "normal" | "high";
};

export async function sendPushToAdminSubscriptions(
  adminId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isAdminPushConfigured()) return { sent: 0, failed: 0 };

  const kf = getKasiFindPrisma();
  const subs = await kf.kfAdminPushSubscription.findMany({
    where: { adminId, active: true },
  });
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const json = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
    tag: payload.tag,
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        json,
        {
          urgency: payload.urgency ?? "normal",
          TTL: 60 * 60 * 24,
        }
      );
      sent += 1;
      await kf.kfAdminPushSubscription.update({
        where: { id: sub.id },
        data: { failureCount: 0, lastSuccessAt: new Date() },
      });
    } catch (err: unknown) {
      failed += 1;
      const status = typeof err === "object" && err && "statusCode" in err ? (err as { statusCode?: number }).statusCode : undefined;
      const gone = status === 404 || status === 410;
      await kf.kfAdminPushSubscription.update({
        where: { id: sub.id },
        data: {
          active: gone ? false : sub.active,
          failureCount: { increment: 1 },
        },
      });
    }
  }

  return { sent, failed };
}
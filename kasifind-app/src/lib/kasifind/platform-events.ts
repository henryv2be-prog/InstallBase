import "server-only";
import type { KfNotificationPriority } from "@/generated/prisma/enums";
import { KfAdminNotificationDeliveryStatus } from "@/generated/prisma/enums";
import { buildAdminNotificationCopy } from "@/lib/kasifind/admin-notification-deeplinks";
import { listActiveAdminIds, ensureAdminNotificationDefaults } from "@/lib/kasifind/admin-notification-prefs";
import { sendPushToAdminSubscriptions, isAdminPushConfigured } from "@/lib/kasifind/admin-push";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { assertPlatformEventType } from "@/lib/kasifind/platform-event-registry";

export type RecordPlatformEventInput = {
  eventType: string;
  metadata?: Record<string, unknown> | null;
  entityType?: string | null;
  entityId?: string | null;
  idempotencyKey?: string | null;
};

export async function recordPlatformEvent(input: RecordPlatformEventInput): Promise<string | null> {
  if (!isKasiFindDbConfigured()) return null;

  const def = assertPlatformEventType(input.eventType);
  const kf = getKasiFindPrisma();

  let eventId: string;
  try {
    const row = await kf.kfPlatformEvent.create({
      data: {
        eventType: def.eventType,
        category: def.category,
        priority: def.priority as KfNotificationPriority,
        metadata: input.metadata != null ? (input.metadata as object) : undefined,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        idempotencyKey: input.idempotencyKey?.trim() || null,
      },
      select: { id: true },
    });
    eventId = row.id;
  } catch (err: unknown) {
    const code =
      typeof err === "object" && err && "code" in err ? String((err as { code?: string }).code) : "";
    if (code === "P2002" && input.idempotencyKey) {
      const existing = await kf.kfPlatformEvent.findUnique({
        where: { idempotencyKey: input.idempotencyKey.trim() },
        select: { id: true },
      });
      if (existing) return existing.id;
    }
    throw err;
  }

  try {
    await dispatchAdminNotificationsForEvent(eventId);
  } catch {
    // Push/in-app failures must not break callers
  }

  return eventId;
}

/** Fire-and-forget wrapper for server actions. */
export function safeRecordPlatformEvent(input: RecordPlatformEventInput): void {
  void recordPlatformEvent(input).catch(() => undefined);
}

export async function dispatchAdminNotificationsForEvent(eventId: string) {
  const kf = getKasiFindPrisma();
  const event = await kf.kfPlatformEvent.findUnique({ where: { id: eventId } });
  if (!event) return;

  const copy = buildAdminNotificationCopy(
    event.eventType,
  (event.metadata as Record<string, unknown> | null) ?? null
  );

  const adminIds = await listActiveAdminIds();
  await Promise.all(adminIds.map((adminId) => ensureAdminNotificationDefaults(adminId)));

  const prefs = await kf.kfAdminNotificationPreference.findMany({
    where: { adminId: { in: adminIds }, eventType: event.eventType },
  });
  const prefByAdmin = new Map(prefs.map((p) => [p.adminId, p]));

  const settings = await kf.kfAdminNotificationSettings.findMany({
    where: { adminId: { in: adminIds } },
  });
  const masterByAdmin = new Map(settings.map((s) => [s.adminId, s.pushMasterEnabled]));

  const pushReady = isAdminPushConfigured();
  const urgency =
    event.priority === "CRITICAL" ? "high" : event.priority === "IMPORTANT" ? "normal" : "low";

  for (const adminId of adminIds) {
    const pref = prefByAdmin.get(adminId);
    const inApp = pref?.inAppEnabled ?? true;
    const pushAllowed =
      pushReady &&
      (masterByAdmin.get(adminId) ?? false) &&
      (pref?.pushEnabled ?? false);

    if (!inApp && !pushAllowed) continue;

    let delivery: KfAdminNotificationDeliveryStatus = KfAdminNotificationDeliveryStatus.PENDING;
    if (!pushAllowed) delivery = KfAdminNotificationDeliveryStatus.IN_APP_ONLY;
    else if (!inApp) delivery = KfAdminNotificationDeliveryStatus.PENDING;

    let notificationId: string;
    try {
      const created = await kf.kfAdminNotification.create({
        data: {
          eventId: event.id,
          adminId,
          title: copy.title,
          body: copy.body,
          deepLink: copy.deepLink,
          priority: event.priority,
          category: event.category,
          deliveryStatus: delivery,
        },
        select: { id: true },
      });
      notificationId = created.id;
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err && "code" in err ? String((err as { code?: string }).code) : "";
      if (code === "P2002") continue;
      throw err;
    }

    if (!pushAllowed) continue;

    const result = await sendPushToAdminSubscriptions(adminId, {
      title: copy.title,
      body: copy.body,
      url: copy.deepLink,
      tag: `kf-${event.eventType}-${event.id}`,
      urgency,
    });

    const status =
      result.sent > 0
        ? KfAdminNotificationDeliveryStatus.PUSH_SENT
        : result.failed > 0
          ? KfAdminNotificationDeliveryStatus.PUSH_FAILED
          : KfAdminNotificationDeliveryStatus.PUSH_SKIPPED;

    await kf.kfAdminNotification.update({
      where: { id: notificationId },
      data: {
        deliveryStatus: inApp ? status : status,
        pushAttemptedAt: new Date(),
      },
    });
  }
}
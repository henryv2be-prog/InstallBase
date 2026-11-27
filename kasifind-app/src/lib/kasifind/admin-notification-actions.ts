"use server";

import { revalidatePath } from "next/cache";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { ensureAdminNotificationDefaults } from "@/lib/kasifind/admin-notification-prefs";
import { sendPushToAdminSubscriptions, isAdminPushConfigured } from "@/lib/kasifind/admin-push";
import {
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "@/lib/kasifind/admin-notifications";
import { safeRecordPlatformEvent } from "@/lib/kasifind/platform-events";
import { requireKasiFindAdmin } from "@/lib/kasifind/session";
import { PLATFORM_EVENT_REGISTRY } from "@/lib/kasifind/platform-event-registry";

function dbGuard() {
  if (!isKasiFindDbConfigured()) {
    return { error: "KasiFind database is not configured (KASIFIND_DATABASE_URL)." };
  }
  return null;
}

export async function kfAdminMarkNotificationRead(notificationId: string) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;
  await markAdminNotificationRead(auth.user.id, notificationId);
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function kfAdminMarkAllNotificationsRead() {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;
  await markAllAdminNotificationsRead(auth.user.id);
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function kfAdminSaveNotificationSettings(formData: FormData) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const pushMaster = formData.get("pushMasterEnabled") === "on";
  const kf = getKasiFindPrisma();
  await ensureAdminNotificationDefaults(auth.user.id);

  await kf.kfAdminNotificationSettings.upsert({
    where: { adminId: auth.user.id },
    create: { adminId: auth.user.id, pushMasterEnabled: pushMaster },
    update: { pushMasterEnabled: pushMaster },
  });

  for (const def of PLATFORM_EVENT_REGISTRY) {
    const inApp = formData.get(`inApp:${def.eventType}`) === "on";
    const push = formData.get(`push:${def.eventType}`) === "on";
    await kf.kfAdminNotificationPreference.upsert({
      where: { adminId_eventType: { adminId: auth.user.id, eventType: def.eventType } },
      create: {
        adminId: auth.user.id,
        eventType: def.eventType,
        inAppEnabled: inApp,
        pushEnabled: push,
      },
      update: { inAppEnabled: inApp, pushEnabled: push },
    });
  }

  safeRecordPlatformEvent({
    eventType: "admin.notification_settings_changed",
    metadata: { adminId: auth.user.id },
    entityType: "admin",
    entityId: auth.user.id,
    idempotencyKey: `admin.notification_settings_changed:${auth.user.id}:${Date.now()}`,
  });

  revalidatePath("/admin/notifications/settings");
  return { success: true };
}

export async function kfAdminRemovePushDevice(subscriptionId: string) {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;

  const kf = getKasiFindPrisma();
  await kf.kfAdminPushSubscription.updateMany({
    where: { id: subscriptionId, adminId: auth.user.id },
    data: { active: false },
  });
  revalidatePath("/admin/notifications/settings");
  return { success: true };
}

export async function kfAdminSendTestPush() {
  const guard = dbGuard();
  if (guard) return guard;
  const auth = await requireKasiFindAdmin();
  if ("error" in auth) return auth;
  if (!isAdminPushConfigured()) return { error: "Push is not configured on the server (VAPID keys)." };

  const result = await sendPushToAdminSubscriptions(auth.user.id, {
    title: "KasiFind – Test notification",
    body: "If you see this, Android push is working.",
    url: "/admin/notifications",
    tag: "kf-test",
    urgency: "normal",
  });
  if (result.sent === 0) return { error: "No active device subscriptions — enable push on this phone first." };
  return { success: true, sent: result.sent };
}
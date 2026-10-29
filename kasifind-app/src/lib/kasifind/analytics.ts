import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import type { KfAnalyticsEventType } from "@/generated/prisma/enums";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";

export const KF_VISITOR_COOKIE = "kf_vid";
const VISITOR_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export type TrackEventInput = {
  eventType: KfAnalyticsEventType;
  listingId?: string | null;
  categoryId?: string | null;
  query?: string | null;
  regionLabel?: string | null;
  visitorId?: string | null;
};

export async function getOrCreateVisitorId(existing?: string | null): Promise<string> {
  const trimmed = existing?.trim();
  if (trimmed && trimmed.length >= 8 && trimmed.length <= 64) return trimmed;

  const id = randomUUID().replace(/-/g, "");
  const jar = await cookies();
  jar.set(KF_VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_MAX_AGE_SEC,
  });
  return id;
}

export async function readVisitorIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(KF_VISITOR_COOKIE)?.value ?? null;
}

export async function recordAnalyticsEvent(input: TrackEventInput): Promise<void> {
  const kf = getKasiFindPrisma();
  const visitorId = await getOrCreateVisitorId(input.visitorId);
  const sessionUser = await getKasiFindSessionUser();

  if (sessionUser) {
    await kf.kfUser.update({
      where: { id: sessionUser.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => undefined);
  }

  await kf.kfAnalyticsEvent.create({
    data: {
      eventType: input.eventType,
      listingId: input.listingId || null,
      categoryId: input.categoryId || null,
      userId: sessionUser?.id ?? null,
      visitorId,
      query: input.query?.slice(0, 200) || null,
      regionLabel: input.regionLabel?.slice(0, 120) || null,
    },
  });
}

export function isListingClickEvent(type: KfAnalyticsEventType): boolean {
  return (
    type === "LISTING_CLICK_WHATSAPP" ||
    type === "LISTING_CLICK_CALL" ||
    type === "LISTING_CLICK_DIRECTIONS"
  );
}

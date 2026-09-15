import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdEventType } from "@/generated/prisma/client";
import { getAdSettings } from "./settings";

const DEDUP_WINDOW_MS = 30 * 60 * 1000;

function startOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function isDuplicateEvent(
  advertisementId: string,
  eventType: AdEventType,
  viewerKey: string | undefined
) {
  if (!viewerKey) return false;
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const existing = await prisma.adEvent.findFirst({
    where: {
      advertisementId,
      eventType,
      viewerKey,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function recordAdEvent(input: {
  advertisementId: string;
  placementKey: string;
  eventType: AdEventType;
  viewerKey?: string;
  deviceType?: string;
}) {
  const settings = await getAdSettings();
  if (!settings.analyticsEnabled) return { recorded: false };

  const ad = await prisma.advertisement.findUnique({
    where: { id: input.advertisementId },
    select: { id: true, campaignId: true, status: true },
  });
  if (!ad || ad.status !== "ACTIVE") return { recorded: false };

  const duplicate = await isDuplicateEvent(
    input.advertisementId,
    input.eventType,
    input.viewerKey
  );
  if (duplicate) return { recorded: false, duplicate: true };

  const isUnique = input.viewerKey
    ? !(await prisma.adEvent.findFirst({
        where: {
          advertisementId: input.advertisementId,
          eventType: input.eventType,
          viewerKey: input.viewerKey,
        },
        select: { id: true },
      }))
    : false;

  const today = startOfDay();

  await prisma.$transaction([
    prisma.adEvent.create({
      data: {
        advertisementId: input.advertisementId,
        campaignId: ad.campaignId,
        placementKey: input.placementKey,
        eventType: input.eventType,
        viewerKey: input.viewerKey?.slice(0, 64),
        deviceType: input.deviceType?.slice(0, 32),
      },
    }),
    prisma.advertisement.update({
      where: { id: input.advertisementId },
      data: {
        impressions: input.eventType === "IMPRESSION" ? { increment: 1 } : undefined,
        clicks: input.eventType === "CLICK" ? { increment: 1 } : undefined,
        uniqueImpressions:
          input.eventType === "IMPRESSION" && isUnique ? { increment: 1 } : undefined,
        uniqueClicks: input.eventType === "CLICK" && isUnique ? { increment: 1 } : undefined,
      },
    }),
    prisma.adDailyStats.upsert({
      where: {
        advertisementId_placementKey_date: {
          advertisementId: input.advertisementId,
          placementKey: input.placementKey,
          date: today,
        },
      },
      create: {
        advertisementId: input.advertisementId,
        campaignId: ad.campaignId,
        placementKey: input.placementKey,
        date: today,
        impressions: input.eventType === "IMPRESSION" ? 1 : 0,
        clicks: input.eventType === "CLICK" ? 1 : 0,
        uniqueImpressions: input.eventType === "IMPRESSION" && isUnique ? 1 : 0,
        uniqueClicks: input.eventType === "CLICK" && isUnique ? 1 : 0,
      },
      update: {
        impressions: input.eventType === "IMPRESSION" ? { increment: 1 } : undefined,
        clicks: input.eventType === "CLICK" ? { increment: 1 } : undefined,
        uniqueImpressions:
          input.eventType === "IMPRESSION" && isUnique ? { increment: 1 } : undefined,
        uniqueClicks: input.eventType === "CLICK" && isUnique ? { increment: 1 } : undefined,
      },
    }),
  ]);

  return { recorded: true };
}

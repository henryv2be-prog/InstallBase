import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AdSettingsSnapshot } from "./types";
import { getEnvAdOverrides, mergeAdSettings } from "./config";

const DEFAULTS: AdSettingsSnapshot = {
  adsEnabled: true,
  sponsoredEnabled: true,
  analyticsEnabled: true,
  maxFeedAds: 3,
  minPostsBetweenAds: 4,
  maxPageAds: 5,
  mobileMaxFeedAds: 2,
  desktopMaxFeedAds: 3,
  defaultPriority: 0,
  provider: "internal",
};

export const getAdSettings = cache(async function getAdSettings(): Promise<AdSettingsSnapshot> {
  const row = await prisma.adSettings.findUnique({ where: { id: "global" } });
  const db: AdSettingsSnapshot = row
    ? {
        adsEnabled: row.adsEnabled,
        sponsoredEnabled: row.sponsoredEnabled,
        analyticsEnabled: row.analyticsEnabled,
        maxFeedAds: row.maxFeedAds,
        minPostsBetweenAds: row.minPostsBetweenAds,
        maxPageAds: row.maxPageAds,
        mobileMaxFeedAds: row.mobileMaxFeedAds,
        desktopMaxFeedAds: row.desktopMaxFeedAds,
        defaultPriority: row.defaultPriority,
        provider: row.provider,
      }
    : DEFAULTS;

  return mergeAdSettings(db, getEnvAdOverrides());
});

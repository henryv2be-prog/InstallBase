import type { AdSettingsSnapshot } from "./types";

function envBool(key: string, fallback: boolean) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

function envInt(key: string, fallback: number) {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Environment overrides layered on top of database settings. */
export function getEnvAdOverrides(): Partial<AdSettingsSnapshot> {
  return {
    adsEnabled: process.env.ADS_ENABLED !== undefined ? envBool("ADS_ENABLED", true) : undefined,
    maxFeedAds: process.env.MAX_FEED_ADS ? envInt("MAX_FEED_ADS", 3) : undefined,
    minPostsBetweenAds: process.env.MIN_POSTS_BETWEEN_ADS
      ? envInt("MIN_POSTS_BETWEEN_ADS", 4)
      : undefined,
    maxPageAds: process.env.MAX_PAGE_ADS ? envInt("MAX_PAGE_ADS", 5) : undefined,
    mobileMaxFeedAds: process.env.MOBILE_MAX_FEED_ADS
      ? envInt("MOBILE_MAX_FEED_ADS", 2)
      : undefined,
    desktopMaxFeedAds: process.env.DESKTOP_MAX_FEED_ADS
      ? envInt("DESKTOP_MAX_FEED_ADS", 3)
      : undefined,
    provider: process.env.AD_PROVIDER ?? undefined,
  };
}

export function mergeAdSettings(
  db: AdSettingsSnapshot,
  overrides: Partial<AdSettingsSnapshot> = getEnvAdOverrides()
): AdSettingsSnapshot {
  return { ...db, ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v !== undefined)) };
}

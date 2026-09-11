import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdvertisingProvider } from "./provider";
import type { AdCreative, AdFetchOptions } from "./types";
import { matchesTargeting, parseTargetingRules } from "./targeting";
import { getAdSettings } from "./settings";

function toCreative(ad: {
  id: string;
  campaignId: string;
  advertiserId: string;
  title: string;
  description: string | null;
  type: AdCreative["type"];
  placements: string[];
  mediaUrl: string | null;
  mediaType: string | null;
  destinationUrl: string;
  ctaText: string | null;
  isInternalLink: boolean;
  sponsoredProductId: string | null;
  sponsoredPostId: string | null;
  priority: number;
  advertiser: { name: string; logoUrl: string | null };
}): AdCreative {
  const label =
    ad.type === "SPONSORED_POST" || ad.type === "SPONSORED_PRODUCT" || ad.type === "SPONSORED_ARTICLE"
      ? "Sponsored"
      : ad.type === "BANNER"
        ? "Advertisement"
        : "Promoted";

  return {
    id: ad.id,
    campaignId: ad.campaignId,
    advertiserId: ad.advertiserId,
    advertiserName: ad.advertiser.name,
    advertiserLogoUrl: ad.advertiser.logoUrl,
    title: ad.title,
    description: ad.description,
    type: ad.type,
    placements: ad.placements,
    mediaUrl: ad.mediaUrl,
    mediaType: ad.mediaType,
    destinationUrl: ad.destinationUrl,
    ctaText: ad.ctaText,
    isInternalLink: ad.isInternalLink,
    sponsoredProductId: ad.sponsoredProductId,
    sponsoredPostId: ad.sponsoredPostId,
    priority: ad.priority,
    label,
  };
}

function deviceMatches(
  inventoryDevice: string,
  device?: "mobile" | "desktop" | "tablet"
) {
  if (!device || inventoryDevice === "ALL") return true;
  return inventoryDevice === device.toUpperCase();
}

export class InternalAdvertisingProvider implements AdvertisingProvider {
  readonly name = "internal";

  async getAds(options: AdFetchOptions): Promise<AdCreative[]> {
    const settings = await getAdSettings();
    if (!settings.adsEnabled) return [];

    const sponsoredTypes = ["SPONSORED_POST", "SPONSORED_PRODUCT", "SPONSORED_ARTICLE"];
    const now = new Date();
    const limit = options.limit ?? 1;

    const inventory = await prisma.adInventory.findUnique({
      where: { placementKey: options.placement },
      select: { enabled: true, deviceSupport: true },
    });
    if (!inventory?.enabled) return [];
    if (!deviceMatches(inventory.deviceSupport, options.device)) return [];

    const ads = await prisma.advertisement.findMany({
      where: {
        status: "ACTIVE",
        placements: { has: options.placement },
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          {
            campaign: {
              status: "ACTIVE",
              AND: [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] },
              ],
            },
          },
        ],
      },
      include: { advertiser: { select: { name: true, logoUrl: true } } },
      orderBy: [{ priority: "desc" }, { impressions: "asc" }, { createdAt: "desc" }],
      take: Math.min(limit * 4, 20),
    });

    const filtered = ads.filter((ad) => {
      if (!settings.sponsoredEnabled && sponsoredTypes.includes(ad.type)) return false;
      const rules = parseTargetingRules(ad.targetingRules);
      return matchesTargeting(rules, options.targeting ?? {});
    });

    return filtered.slice(0, limit).map(toCreative);
  }
}

let provider: InternalAdvertisingProvider | null = null;

export function getAdvertisingProvider(): AdvertisingProvider {
  const name = process.env.AD_PROVIDER ?? "internal";
  if (name !== "internal") {
    // Future: return GoogleAdProvider etc.
    console.warn(`[ads] Provider "${name}" not implemented — falling back to internal`);
  }
  if (!provider) provider = new InternalAdvertisingProvider();
  return provider;
}

export async function fetchAdsForPlacement(
  placement: AdFetchOptions["placement"],
  options: Omit<AdFetchOptions, "placement"> = {}
) {
  return getAdvertisingProvider().getAds({ placement, ...options });
}

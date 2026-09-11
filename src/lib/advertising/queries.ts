import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdAdminOverview() {
  const now = new Date();
  const [
    activeCampaigns,
    activeAds,
    advertisers,
    totals,
    inventory,
  ] = await Promise.all([
    prisma.adCampaign.count({ where: { status: "ACTIVE" } }),
    prisma.advertisement.count({ where: { status: "ACTIVE" } }),
    prisma.advertiser.count(),
    prisma.advertisement.aggregate({
      _sum: { impressions: true, clicks: true },
    }),
    prisma.adInventory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const impressions = totals._sum.impressions ?? 0;
  const clicks = totals._sum.clicks ?? 0;
  const avgCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  const revenueReady = await prisma.adCampaign.count({
    where: {
      status: "ACTIVE",
      pricingModel: { not: null },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
  });

  return {
    activeCampaigns,
    activeAds,
    advertisers,
    totalImpressions: impressions,
    totalClicks: clicks,
    avgCtr,
    revenueReady,
    inventory,
  };
}

export async function getAdAdminList(filters?: {
  advertiserId?: string;
  campaignId?: string;
  status?: string;
  placement?: string;
  type?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.advertiserId) where.advertiserId = filters.advertiserId;
  if (filters?.campaignId) where.campaignId = filters.campaignId;
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.placement) where.placements = { has: filters.placement };

  const [advertisers, campaigns, advertisements, settings] = await Promise.all([
    prisma.advertiser.findMany({ orderBy: { name: "asc" } }),
    prisma.adCampaign.findMany({
      include: { advertiser: true, advertisements: true },
      orderBy: { updatedAt: "desc" },
      where: filters?.advertiserId ? { advertiserId: filters.advertiserId } : undefined,
    }),
    prisma.advertisement.findMany({
      where,
      include: { advertiser: true, campaign: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.adSettings.findUnique({ where: { id: "global" } }),
  ]);

  return { advertisers, campaigns, advertisements, settings };
}

export async function getCampaignPerformance(campaignId: string) {
  const ads = await prisma.advertisement.findMany({
    where: { campaignId },
    select: {
      id: true,
      title: true,
      impressions: true,
      clicks: true,
      uniqueImpressions: true,
      uniqueClicks: true,
      placements: true,
      status: true,
    },
  });
  const totals = ads.reduce(
    (acc, ad) => ({
      impressions: acc.impressions + ad.impressions,
      clicks: acc.clicks + ad.clicks,
    }),
    { impressions: 0, clicks: 0 }
  );
  return {
    ads,
    totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
  };
}

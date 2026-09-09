import type { PrismaClient } from "../src/generated/prisma/client";

/** Upserts the Hikvision demo ad campaign only — safe on live databases. */
export async function seedDemoAdCampaign(prisma: PrismaClient) {
  const advertiser = await prisma.advertiser.upsert({
    where: { slug: "hikvision-demo" },
    update: {
      name: "Hikvision Demo",
      description: "Sample advertiser for InstallBase ad system demo.",
      companyType: "Manufacturer",
      website: "https://www.hikvision.com",
      contactEmail: "ads@example.com",
    },
    create: {
      name: "Hikvision Demo",
      slug: "hikvision-demo",
      description: "Sample advertiser for InstallBase ad system demo.",
      companyType: "Manufacturer",
      website: "https://www.hikvision.com",
      contactEmail: "ads@example.com",
    },
  });

  const campaign = await prisma.adCampaign.upsert({
    where: { id: "seed-demo-campaign" },
    update: {
      status: "ACTIVE",
      priority: 10,
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 90 * 86400000),
    },
    create: {
      id: "seed-demo-campaign",
      advertiserId: advertiser.id,
      name: "Q3 Installer Outreach",
      status: "ACTIVE",
      pricingModel: "CPM",
      budget: 5000,
      priority: 10,
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 90 * 86400000),
    },
  });

  const ad = await prisma.advertisement.upsert({
    where: { id: "seed-demo-ad-feed" },
    update: {
      status: "ACTIVE",
      priority: 10,
    },
    create: {
      id: "seed-demo-ad-feed",
      campaignId: campaign.id,
      advertiserId: advertiser.id,
      title: "Professional CCTV for every install",
      description: "Turbo HD cameras with PoE — trusted on site worldwide.",
      type: "SPONSORED_POST",
      placements: ["feed_between_posts", "feed_top", "community", "search_results"],
      status: "ACTIVE",
      mediaUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
      mediaType: "image",
      destinationUrl: "/discover?tab=products",
      ctaText: "Explore products",
      isInternalLink: true,
      priority: 10,
      targetingRules: { trades: ["CCTV", "Security"] },
    },
  });

  return { advertiser, campaign, ad };
}

export function logDemoAdSeedResult({
  advertiser,
  campaign,
  ad,
}: Awaited<ReturnType<typeof seedDemoAdCampaign>>) {
  console.log("✅ Demo ad campaign ready");
  console.log(`   Advertiser: ${advertiser.name} (${advertiser.slug})`);
  console.log(`   Campaign:   ${campaign.name} [${campaign.status}]`);
  console.log(`   Ad:         ${ad.title} [${ad.status}]`);
  console.log(`   Placements: ${ad.placements.join(", ")}`);
  console.log("");
  console.log("Note: ad targets users with CCTV or Security specialties.");
  console.log("Guests and other users won't see it unless targeting is cleared in /admin/ads.");
}

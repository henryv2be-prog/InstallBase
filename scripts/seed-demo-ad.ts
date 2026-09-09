/**
 * Seeds ONLY the Hikvision demo advertising campaign.
 * Safe to run on a live database — uses upsert, does not touch users/posts/etc.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-ad.ts
 *
 * On Railway:
 *   railway run npx tsx scripts/seed-demo-ad.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log("Seeding Hikvision demo ad campaign only…");

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

  console.log("✅ Demo ad campaign ready");
  console.log(`   Advertiser: ${advertiser.name} (${advertiser.slug})`);
  console.log(`   Campaign:   ${campaign.name} [${campaign.status}]`);
  console.log(`   Ad:         ${ad.title} [${ad.status}]`);
  console.log(`   Placements: ${ad.placements.join(", ")}`);
  console.log("");
  console.log("Note: ad targets users with CCTV or Security specialties.");
  console.log("Guests and other users won't see it unless targeting is cleared in /admin/ads.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

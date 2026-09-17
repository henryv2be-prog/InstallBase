-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('IMAGE', 'BANNER', 'SPONSORED_POST', 'SPONSORED_PRODUCT', 'SPONSORED_ARTICLE', 'VIDEO');
CREATE TYPE "AdStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'COMPLETED');
CREATE TYPE "PricingModel" AS ENUM ('CPM', 'CPC', 'FLAT_RATE', 'MONTHLY', 'PACKAGE');
CREATE TYPE "AdDeviceTarget" AS ENUM ('ALL', 'MOBILE', 'DESKTOP', 'TABLET');
CREATE TYPE "AdEventType" AS ENUM ('IMPRESSION', 'CLICK');

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "companyType" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdInventory" (
    "id" TEXT NOT NULL,
    "placementKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT NOT NULL DEFAULT 'card',
    "width" INTEGER,
    "height" INTEGER,
    "deviceSupport" "AdDeviceTarget" NOT NULL DEFAULT 'ALL',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pricingConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdInventory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdCampaign" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "pricingModel" "PricingModel",
    "budget" DECIMAL(12,2),
    "spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AdType" NOT NULL,
    "placements" TEXT[],
    "status" "AdStatus" NOT NULL DEFAULT 'DRAFT',
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "destinationUrl" TEXT NOT NULL,
    "ctaText" TEXT,
    "isInternalLink" BOOLEAN NOT NULL DEFAULT false,
    "sponsoredProductId" TEXT,
    "sponsoredPostId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "uniqueImpressions" INTEGER NOT NULL DEFAULT 0,
    "uniqueClicks" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetingRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdEvent" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placementKey" TEXT NOT NULL,
    "eventType" "AdEventType" NOT NULL,
    "viewerKey" TEXT,
    "deviceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdDailyStats" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placementKey" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "uniqueImpressions" INTEGER NOT NULL DEFAULT 0,
    "uniqueClicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdDailyStats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "adsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sponsoredEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxFeedAds" INTEGER NOT NULL DEFAULT 3,
    "minPostsBetweenAds" INTEGER NOT NULL DEFAULT 4,
    "maxPageAds" INTEGER NOT NULL DEFAULT 5,
    "mobileMaxFeedAds" INTEGER NOT NULL DEFAULT 2,
    "desktopMaxFeedAds" INTEGER NOT NULL DEFAULT 3,
    "defaultPriority" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT NOT NULL DEFAULT 'internal',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdSettings_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "Advertiser_slug_key" ON "Advertiser"("slug");
CREATE INDEX "Advertiser_userId_idx" ON "Advertiser"("userId");
CREATE UNIQUE INDEX "AdInventory_placementKey_key" ON "AdInventory"("placementKey");
CREATE INDEX "AdCampaign_advertiserId_idx" ON "AdCampaign"("advertiserId");
CREATE INDEX "AdCampaign_status_startDate_endDate_idx" ON "AdCampaign"("status", "startDate", "endDate");
CREATE INDEX "Advertisement_campaignId_idx" ON "Advertisement"("campaignId");
CREATE INDEX "Advertisement_advertiserId_idx" ON "Advertisement"("advertiserId");
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");
CREATE INDEX "Advertisement_status_startDate_endDate_idx" ON "Advertisement"("status", "startDate", "endDate");
CREATE INDEX "AdEvent_advertisementId_eventType_createdAt_idx" ON "AdEvent"("advertisementId", "eventType", "createdAt");
CREATE INDEX "AdEvent_campaignId_createdAt_idx" ON "AdEvent"("campaignId", "createdAt");
CREATE INDEX "AdEvent_placementKey_createdAt_idx" ON "AdEvent"("placementKey", "createdAt");
CREATE INDEX "AdEvent_viewerKey_advertisementId_eventType_createdAt_idx" ON "AdEvent"("viewerKey", "advertisementId", "eventType", "createdAt");
CREATE UNIQUE INDEX "AdDailyStats_advertisementId_placementKey_date_key" ON "AdDailyStats"("advertisementId", "placementKey", "date");
CREATE INDEX "AdDailyStats_campaignId_date_idx" ON "AdDailyStats"("campaignId", "date");

-- Foreign keys
ALTER TABLE "AdCampaign" ADD CONSTRAINT "AdCampaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdEvent" ADD CONSTRAINT "AdEvent_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdEvent" ADD CONSTRAINT "AdEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdDailyStats" ADD CONSTRAINT "AdDailyStats_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdDailyStats" ADD CONSTRAINT "AdDailyStats_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default settings
INSERT INTO "AdSettings" ("id", "adsEnabled", "sponsoredEnabled", "analyticsEnabled", "maxFeedAds", "minPostsBetweenAds", "maxPageAds", "mobileMaxFeedAds", "desktopMaxFeedAds", "defaultPriority", "provider", "updatedAt")
VALUES ('global', true, true, true, 3, 4, 5, 2, 3, 0, 'internal', CURRENT_TIMESTAMP);

-- Ad inventory placements
INSERT INTO "AdInventory" ("id", "placementKey", "name", "description", "format", "width", "height", "deviceSupport", "enabled", "updatedAt") VALUES
  ('inv_feed_top', 'feed_top', 'Feed Top', 'Banner above the feed post list', 'banner', 728, 90, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_feed_between', 'feed_between_posts', 'Feed Between Posts', 'Sponsored card between feed posts', 'card', 600, 400, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_feed_sidebar', 'feed_sidebar', 'Feed Sidebar', 'Desktop sidebar beside feed', 'banner', 300, 250, 'DESKTOP', true, CURRENT_TIMESTAMP),
  ('inv_homepage', 'homepage', 'Homepage', 'Landing page promotional slot', 'banner', 970, 250, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_community', 'community', 'Community Pages', 'Community and explore pages', 'card', 600, 400, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_search', 'search_results', 'Search Results', 'Between search result groups', 'card', 600, 200, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_marketplace', 'marketplace', 'Marketplace', 'Product marketplace listings', 'card', 600, 400, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_supplier', 'supplier', 'Supplier Pages', 'Manufacturer and supplier profiles', 'banner', 728, 90, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_article', 'article', 'Article Pages', 'Sponsored technical articles', 'card', 600, 400, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_job', 'job', 'Job Pages', 'Job listing sponsorship', 'card', 600, 200, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_dashboard', 'dashboard', 'Dashboard', 'User dashboard placements', 'card', 600, 200, 'ALL', true, CURRENT_TIMESTAMP),
  ('inv_mobile_feed', 'mobile_feed', 'Mobile Feed', 'Mobile-optimised feed ads', 'card', 320, 250, 'MOBILE', true, CURRENT_TIMESTAMP),
  ('inv_desktop_sidebar', 'desktop_sidebar', 'Desktop Sidebar', 'Global desktop sidebar', 'banner', 300, 600, 'DESKTOP', true, CURRENT_TIMESTAMP),
  ('inv_header_banner', 'header_banner', 'Header Banner', 'Below main navigation', 'banner', 970, 90, 'ALL', true, CURRENT_TIMESTAMP);

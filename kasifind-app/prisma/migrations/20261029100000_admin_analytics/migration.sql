-- CreateEnum
CREATE TYPE "KfAnalyticsEventType" AS ENUM ('LISTING_VIEW', 'LISTING_CLICK_WHATSAPP', 'LISTING_CLICK_CALL', 'LISTING_CLICK_DIRECTIONS', 'SEARCH', 'CATEGORY_BROWSE');

-- AlterTable
ALTER TABLE "KfUser" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "KfProviderListing" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "KfProviderListing" ADD COLUMN "featuredAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KfAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" "KfAnalyticsEventType" NOT NULL,
    "listingId" TEXT,
    "categoryId" TEXT,
    "userId" TEXT,
    "visitorId" TEXT NOT NULL,
    "query" TEXT,
    "regionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KfAdminAudit_createdAt_idx" ON "KfAdminAudit"("createdAt");

-- CreateIndex
CREATE INDEX "KfAnalyticsEvent_eventType_createdAt_idx" ON "KfAnalyticsEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "KfAnalyticsEvent_listingId_createdAt_idx" ON "KfAnalyticsEvent"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "KfAnalyticsEvent_visitorId_idx" ON "KfAnalyticsEvent"("visitorId");

-- CreateIndex
CREATE INDEX "KfAnalyticsEvent_createdAt_idx" ON "KfAnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "KfAnalyticsEvent_categoryId_idx" ON "KfAnalyticsEvent"("categoryId");

-- AddForeignKey
ALTER TABLE "KfAnalyticsEvent" ADD CONSTRAINT "KfAnalyticsEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KfAnalyticsEvent" ADD CONSTRAINT "KfAnalyticsEvent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KfCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KfAnalyticsEvent" ADD CONSTRAINT "KfAnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "KfUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

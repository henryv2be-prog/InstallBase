-- CreateEnum
CREATE TYPE "KfUserRole" AS ENUM ('PROVIDER', 'ADMIN');
CREATE TYPE "KfListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'DISABLED');
CREATE TYPE "KfModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "KfUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "role" "KfUserRole" NOT NULL DEFAULT 'PROVIDER',
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KfUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfProviderListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "hideExactLocation" BOOLEAN NOT NULL DEFAULT true,
    "priceHint" TEXT,
    "hoursNote" TEXT,
    "status" "KfListingStatus" NOT NULL DEFAULT 'DRAFT',
    "moderationStatus" "KfModerationStatus" NOT NULL DEFAULT 'PENDING',
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KfProviderListing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfListingCategory" (
    "listingId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "KfListingCategory_pkey" PRIMARY KEY ("listingId","categoryId")
);

CREATE TABLE "KfProviderService" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfProviderService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfProviderPhoto" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfProviderPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfReview" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfReport" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "reviewId" TEXT,
    "reporterId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfAdminAudit" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfAdminAudit_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "KfUser_email_key" ON "KfUser"("email");
CREATE UNIQUE INDEX "KfCategory_slug_key" ON "KfCategory"("slug");
CREATE UNIQUE INDEX "KfProviderListing_userId_key" ON "KfProviderListing"("userId");
CREATE INDEX "KfProviderService_listingId_idx" ON "KfProviderService"("listingId");
CREATE INDEX "KfProviderPhoto_listingId_idx" ON "KfProviderPhoto"("listingId");
CREATE INDEX "KfReview_listingId_idx" ON "KfReview"("listingId");
CREATE INDEX "KfProviderListing_lat_lng_idx" ON "KfProviderListing"("latitude", "longitude");

-- ForeignKeys
ALTER TABLE "KfCategory" ADD CONSTRAINT "KfCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "KfCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KfProviderListing" ADD CONSTRAINT "KfProviderListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfListingCategory" ADD CONSTRAINT "KfListingCategory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfListingCategory" ADD CONSTRAINT "KfListingCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KfCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfProviderService" ADD CONSTRAINT "KfProviderService_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfProviderPhoto" ADD CONSTRAINT "KfProviderPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfReview" ADD CONSTRAINT "KfReview_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfReview" ADD CONSTRAINT "KfReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "KfUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KfReport" ADD CONSTRAINT "KfReport_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KfReport" ADD CONSTRAINT "KfReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "KfUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Listing assistance requests (provider → admin help)

CREATE TYPE "KfListingAssistanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

CREATE TABLE "KfListingAssistanceRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerMessage" TEXT,
    "status" "KfListingAssistanceStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KfListingAssistanceRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfListingAssistanceStatusEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fromStatus" "KfListingAssistanceStatus",
    "toStatus" "KfListingAssistanceStatus" NOT NULL,
    "adminId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfListingAssistanceStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KfListingAssistanceAuditEntry" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfListingAssistanceAuditEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "KfListingAssistanceRequest_status_createdAt_idx" ON "KfListingAssistanceRequest"("status", "createdAt");
CREATE INDEX "KfListingAssistanceRequest_listingId_idx" ON "KfListingAssistanceRequest"("listingId");
CREATE INDEX "KfListingAssistanceRequest_userId_idx" ON "KfListingAssistanceRequest"("userId");
CREATE INDEX "KfListingAssistanceRequest_createdAt_idx" ON "KfListingAssistanceRequest"("createdAt");

CREATE INDEX "KfListingAssistanceStatusEvent_requestId_createdAt_idx" ON "KfListingAssistanceStatusEvent"("requestId", "createdAt");
CREATE INDEX "KfListingAssistanceAuditEntry_requestId_createdAt_idx" ON "KfListingAssistanceAuditEntry"("requestId", "createdAt");
CREATE INDEX "KfListingAssistanceAuditEntry_listingId_createdAt_idx" ON "KfListingAssistanceAuditEntry"("listingId", "createdAt");

ALTER TABLE "KfListingAssistanceRequest" ADD CONSTRAINT "KfListingAssistanceRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfListingAssistanceRequest" ADD CONSTRAINT "KfListingAssistanceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KfListingAssistanceStatusEvent" ADD CONSTRAINT "KfListingAssistanceStatusEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "KfListingAssistanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfListingAssistanceStatusEvent" ADD CONSTRAINT "KfListingAssistanceStatusEvent_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KfListingAssistanceAuditEntry" ADD CONSTRAINT "KfListingAssistanceAuditEntry_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "KfListingAssistanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfListingAssistanceAuditEntry" ADD CONSTRAINT "KfListingAssistanceAuditEntry_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "KfProviderListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KfListingAssistanceAuditEntry" ADD CONSTRAINT "KfListingAssistanceAuditEntry_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

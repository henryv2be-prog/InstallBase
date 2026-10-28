-- CreateTable
CREATE TABLE "PlatformUpdateBroadcast" (
    "id" TEXT NOT NULL,
    "sentByUserId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformUpdateBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformUpdateBroadcast_createdAt_idx" ON "PlatformUpdateBroadcast"("createdAt");

-- AddForeignKey
ALTER TABLE "PlatformUpdateBroadcast" ADD CONSTRAINT "PlatformUpdateBroadcast_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

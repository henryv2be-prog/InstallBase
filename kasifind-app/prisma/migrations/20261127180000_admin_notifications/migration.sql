-- CreateEnum
CREATE TYPE "KfNotificationPriority" AS ENUM ('INFO', 'IMPORTANT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "KfAdminNotificationDeliveryStatus" AS ENUM ('PENDING', 'IN_APP_ONLY', 'PUSH_SENT', 'PUSH_FAILED', 'PUSH_SKIPPED');

-- CreateTable
CREATE TABLE "KfPlatformEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "KfNotificationPriority" NOT NULL,
    "metadata" JSONB,
    "entityType" TEXT,
    "entityId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfPlatformEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KfAdminPushSubscription" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "deviceLabel" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastSuccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KfAdminPushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KfAdminNotificationPreference" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KfAdminNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KfAdminNotificationSettings" (
    "adminId" TEXT NOT NULL,
    "pushMasterEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KfAdminNotificationSettings_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "KfAdminNotification" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deepLink" TEXT NOT NULL,
    "priority" "KfNotificationPriority" NOT NULL,
    "category" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "deliveryStatus" "KfAdminNotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "pushAttemptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KfAdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KfPlatformEvent_idempotencyKey_key" ON "KfPlatformEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "KfPlatformEvent_eventType_createdAt_idx" ON "KfPlatformEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "KfPlatformEvent_category_createdAt_idx" ON "KfPlatformEvent"("category", "createdAt");

-- CreateIndex
CREATE INDEX "KfPlatformEvent_entityType_entityId_idx" ON "KfPlatformEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "KfPlatformEvent_createdAt_idx" ON "KfPlatformEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "KfAdminPushSubscription_endpoint_key" ON "KfAdminPushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "KfAdminPushSubscription_adminId_active_idx" ON "KfAdminPushSubscription"("adminId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "KfAdminNotificationPreference_adminId_eventType_key" ON "KfAdminNotificationPreference"("adminId", "eventType");

-- CreateIndex
CREATE INDEX "KfAdminNotificationPreference_adminId_idx" ON "KfAdminNotificationPreference"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "KfAdminNotification_eventId_adminId_key" ON "KfAdminNotification"("eventId", "adminId");

-- CreateIndex
CREATE INDEX "KfAdminNotification_adminId_readAt_createdAt_idx" ON "KfAdminNotification"("adminId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "KfAdminNotification_adminId_createdAt_idx" ON "KfAdminNotification"("adminId", "createdAt");

-- AddForeignKey
ALTER TABLE "KfAdminPushSubscription" ADD CONSTRAINT "KfAdminPushSubscription_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KfAdminNotificationPreference" ADD CONSTRAINT "KfAdminNotificationPreference_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KfAdminNotificationSettings" ADD CONSTRAINT "KfAdminNotificationSettings_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KfAdminNotification" ADD CONSTRAINT "KfAdminNotification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "KfPlatformEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KfAdminNotification" ADD CONSTRAINT "KfAdminNotification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "KfUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
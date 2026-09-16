-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'DAILY_REENGAGEMENT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "dailyDigestEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "lastDailyReengagementAt" TIMESTAMP(3);

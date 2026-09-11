-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('PROFESSIONAL', 'COMPANY_REP', 'EMPLOYER', 'CUSTOMER', 'SEEKING_WORK');

-- CreateTable
CREATE TABLE "UserPlatformRole" (
    "userId" TEXT NOT NULL,
    "role" "PlatformRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPlatformRole_pkey" PRIMARY KEY ("userId","role")
);

-- CreateIndex
CREATE INDEX "UserPlatformRole_role_idx" ON "UserPlatformRole"("role");

-- AddForeignKey
ALTER TABLE "UserPlatformRole" ADD CONSTRAINT "UserPlatformRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing users as professionals (installer-focused legacy platform)
INSERT INTO "UserPlatformRole" ("userId", "role", "createdAt")
SELECT "id", 'PROFESSIONAL', CURRENT_TIMESTAMP FROM "User"
ON CONFLICT DO NOTHING;

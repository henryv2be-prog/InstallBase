-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('TERMS', 'PRIVACY', 'COMMUNITY_GUIDELINES', 'CONTENT_POLICY', 'COOKIES');

-- AlterEnum
ALTER TYPE "ReportReason" ADD VALUE 'COPYRIGHT';
ALTER TYPE "ReportReason" ADD VALUE 'PRIVACY';
ALTER TYPE "ReportReason" ADD VALUE 'CONFIDENTIAL_INFO';
ALTER TYPE "ReportReason" ADD VALUE 'SECURITY_SENSITIVE';
ALTER TYPE "ReportReason" ADD VALUE 'HARASSMENT';
ALTER TYPE "ReportReason" ADD VALUE 'ILLEGAL_CONTENT';

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL,
    "policyType" "PolicyType" NOT NULL,
    "version" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPolicyAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyType" "PolicyType" NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "policyVersionId" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPolicyAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_policyType_version_key" ON "PolicyVersion"("policyType", "version");

-- CreateIndex
CREATE INDEX "PolicyVersion_policyType_active_idx" ON "PolicyVersion"("policyType", "active");

-- CreateIndex
CREATE INDEX "UserPolicyAcceptance_userId_policyType_idx" ON "UserPolicyAcceptance"("userId", "policyType");

-- CreateIndex
CREATE INDEX "UserPolicyAcceptance_userId_acceptedAt_idx" ON "UserPolicyAcceptance"("userId", "acceptedAt");

-- AddForeignKey
ALTER TABLE "UserPolicyAcceptance" ADD CONSTRAINT "UserPolicyAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPolicyAcceptance" ADD CONSTRAINT "UserPolicyAcceptance_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

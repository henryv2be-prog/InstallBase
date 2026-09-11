-- CreateEnum
CREATE TYPE "PostIntent" AS ENUM ('GENERAL', 'PROJECT_INSTALLATION', 'SERVICE_REPAIR', 'PRODUCT_EQUIPMENT', 'TRAINING_CERTIFICATION', 'JOB_VACANCY', 'LOOKING_FOR_WORK', 'LOOKING_FOR_SUBCONTRACTORS', 'LOOKING_FOR_PROFESSIONAL');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'SELF_EMPLOYED', 'CONTRACTOR', 'APPRENTICE', 'STUDENT', 'BETWEEN_JOBS');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "openToWork" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "availableForContract" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "availableForSubcontract" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "willingToTravel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceRadiusKm" INTEGER,
ADD COLUMN     "employmentStatus" "EmploymentStatus",
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "postIntent" "PostIntent" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "workDate" TIMESTAMP(3),
ADD COLUMN     "workDetails" JSONB,
ADD COLUMN     "showExactLocation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inPortfolio" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Profile_openToWork_idx" ON "Profile"("openToWork");

-- CreateIndex
CREATE INDEX "Post_authorId_inPortfolio_createdAt_idx" ON "Post"("authorId", "inPortfolio", "createdAt");

-- CreateIndex
CREATE INDEX "Post_postIntent_createdAt_idx" ON "Post"("postIntent", "createdAt");

-- Existing PROJECT posts become portfolio work evidence
UPDATE "Post" SET "postIntent" = 'PROJECT_INSTALLATION', "inPortfolio" = true WHERE "type" = 'PROJECT';

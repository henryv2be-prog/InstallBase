-- CreateEnum
CREATE TYPE "VideoCompilationStatus" AS ENUM ('NONE', 'QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PostMediaRole" AS ENUM ('SOURCE', 'COMPILED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "videoCompilationStatus" "VideoCompilationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "generatedVideoUrl" TEXT,
ADD COLUMN     "generatedVideoPosterUrl" TEXT,
ADD COLUMN     "videoCompilationError" TEXT;

-- AlterTable
ALTER TABLE "PostMedia" ADD COLUMN     "mediaRole" "PostMediaRole" NOT NULL DEFAULT 'SOURCE';

-- CreateIndex
CREATE INDEX "Post_published_createdAt_idx" ON "Post"("published", "createdAt");

-- Official NSC import bank (papers, batches, verification)

CREATE TYPE "StudyNscExamSession" AS ENUM ('NOVEMBER', 'MAY_JUNE', 'SUPPLEMENTARY', 'OTHER');

CREATE TYPE "StudyOfficialVerificationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

CREATE TABLE "StudyQuestionImportBatch" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sourceDocumentTitle" TEXT,
    "verificationStatus" "StudyOfficialVerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyQuestionImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyNscPaper" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examYear" INTEGER NOT NULL,
    "examSession" "StudyNscExamSession" NOT NULL,
    "paperNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "questionPaperUrl" TEXT,
    "memorandumUrl" TEXT,
    "dbePortalUrl" TEXT,
    "importBatchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyNscPaper_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StudyQuestion" ADD COLUMN "nscPaperId" TEXT;
ALTER TABLE "StudyQuestion" ADD COLUMN "importBatchId" TEXT;
ALTER TABLE "StudyQuestion" ADD COLUMN "verificationStatus" "StudyOfficialVerificationStatus";

CREATE UNIQUE INDEX "StudyQuestionImportBatch_slug_key" ON "StudyQuestionImportBatch"("slug");
CREATE UNIQUE INDEX "StudyNscPaper_importBatchId_key" ON "StudyNscPaper"("importBatchId");
CREATE UNIQUE INDEX "StudyNscPaper_subjectId_examYear_examSession_paperNumber_key" ON "StudyNscPaper"("subjectId", "examYear", "examSession", "paperNumber");
CREATE INDEX "StudyNscPaper_subjectId_examYear_idx" ON "StudyNscPaper"("subjectId", "examYear");
CREATE UNIQUE INDEX "StudyQuestion_sourceLabel_key" ON "StudyQuestion"("sourceLabel");
CREATE INDEX "StudyQuestion_importBatchId_idx" ON "StudyQuestion"("importBatchId");
CREATE INDEX "StudyQuestion_verificationStatus_sourceKind_idx" ON "StudyQuestion"("verificationStatus", "sourceKind");

ALTER TABLE "StudyNscPaper" ADD CONSTRAINT "StudyNscPaper_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyNscPaper" ADD CONSTRAINT "StudyNscPaper_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "StudyQuestionImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyQuestion" ADD CONSTRAINT "StudyQuestion_nscPaperId_fkey" FOREIGN KEY ("nscPaperId") REFERENCES "StudyNscPaper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudyQuestion" ADD CONSTRAINT "StudyQuestion_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "StudyQuestionImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

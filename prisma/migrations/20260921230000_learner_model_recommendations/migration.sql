-- Learner model: self-confidence, curriculum prerequisites, recommendation log

CREATE TYPE "StudySelfConfidence" AS ENUM ('UNDERSTANDS', 'UNSURE', 'DONT_UNDERSTAND');

CREATE TYPE "StudyRecommendationAction" AS ENUM (
  'PRACTICE_TOPIC',
  'REVIEW_TOPIC',
  'LEARN_CONCEPT',
  'REVISIT_PREREQUISITE',
  'TAKE_ASSESSMENT',
  'TRY_HARDER_QUESTIONS',
  'DO_PAST_PAPER'
);

ALTER TABLE "StudySubtopic" ADD COLUMN "prerequisiteSubtopicId" TEXT;

ALTER TABLE "StudyMastery" ADD COLUMN "selfConfidence" "StudySelfConfidence";

CREATE TABLE "StudyRecommendationLog" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "action" "StudyRecommendationAction" NOT NULL,
    "reasonSummary" TEXT NOT NULL,
    "reasonDetail" JSONB NOT NULL,
    "priorityScore" DOUBLE PRECISION NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "sessionId" TEXT,

    CONSTRAINT "StudyRecommendationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StudySubtopic_prerequisiteSubtopicId_idx" ON "StudySubtopic"("prerequisiteSubtopicId");
CREATE INDEX "StudyRecommendationLog_learnerId_shownAt_idx" ON "StudyRecommendationLog"("learnerId", "shownAt");
CREATE INDEX "StudyRecommendationLog_learnerId_subtopicId_idx" ON "StudyRecommendationLog"("learnerId", "subtopicId");

ALTER TABLE "StudySubtopic" ADD CONSTRAINT "StudySubtopic_prerequisiteSubtopicId_fkey" FOREIGN KEY ("prerequisiteSubtopicId") REFERENCES "StudySubtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudyRecommendationLog" ADD CONSTRAINT "StudyRecommendationLog_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "StudyLearner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyRecommendationLog" ADD CONSTRAINT "StudyRecommendationLog_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "StudySubtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

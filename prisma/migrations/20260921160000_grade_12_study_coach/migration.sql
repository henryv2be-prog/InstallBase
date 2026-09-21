-- Grade 12 Study Coach (experimental, additive)

CREATE TYPE "StudyQuestionType" AS ENUM ('MULTIPLE_CHOICE');

CREATE TYPE "StudyContentSourceKind" AS ENUM ('OFFICIAL_CURRICULUM', 'OFFICIAL_PAST_PAPER', 'PRACTICE', 'PROTOTYPE');

CREATE TYPE "StudyPriorityBand" AS ENUM ('NEEDS_ATTENTION', 'KEEP_PRACTISING', 'ON_TRACK');

CREATE TABLE "StudySubject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL DEFAULT 12,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySubject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyCurriculum" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceKind" "StudyContentSourceKind" NOT NULL,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "versionLabel" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyCurriculum_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyTopic" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudySubtopic" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySubtopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyLearner" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "grade" INTEGER NOT NULL DEFAULT 12,
    "schoolYear" INTEGER NOT NULL DEFAULT 2026,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyLearner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyLearnerSubject" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "currentMarkPct" DOUBLE PRECISION NOT NULL,
    "targetMarkPct" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyLearnerSubject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyExam" (
    "id" TEXT NOT NULL,
    "learnerSubjectId" TEXT NOT NULL,
    "examAt" DATE NOT NULL,
    "paperNumber" INTEGER,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyExam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyMastery" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "masteryPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "questionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "confidencePct" DOUBLE PRECISION,
    "priorityScore" DOUBLE PRECISION,
    "priorityBand" "StudyPriorityBand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMastery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyQuestion" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "type" "StudyQuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOptionId" TEXT NOT NULL,
    "explanation" TEXT,
    "sourceKind" "StudyContentSourceKind" NOT NULL,
    "sourceLabel" TEXT,
    "sourceYear" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyAssessmentSession" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudyAssessmentSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyQuestionAttempt" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sessionId" TEXT,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyQuestionAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyPlanDay" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "planDate" DATE NOT NULL,
    "availableMinutes" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyPlanDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyPlanItem" (
    "id" TEXT NOT NULL,
    "planDayId" TEXT NOT NULL,
    "learnerSubjectId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "allocatedMinutes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "StudyPlanItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudySubject_slug_key" ON "StudySubject"("slug");
CREATE INDEX "StudyCurriculum_subjectId_idx" ON "StudyCurriculum"("subjectId");
CREATE UNIQUE INDEX "StudyTopic_curriculumId_slug_key" ON "StudyTopic"("curriculumId", "slug");
CREATE UNIQUE INDEX "StudySubtopic_topicId_slug_key" ON "StudySubtopic"("topicId", "slug");
CREATE UNIQUE INDEX "StudyLearner_userId_key" ON "StudyLearner"("userId");
CREATE UNIQUE INDEX "StudyLearnerSubject_learnerId_subjectId_key" ON "StudyLearnerSubject"("learnerId", "subjectId");
CREATE INDEX "StudyExam_learnerSubjectId_examAt_idx" ON "StudyExam"("learnerSubjectId", "examAt");
CREATE UNIQUE INDEX "StudyMastery_learnerId_subtopicId_key" ON "StudyMastery"("learnerId", "subtopicId");
CREATE INDEX "StudyMastery_learnerId_idx" ON "StudyMastery"("learnerId");
CREATE INDEX "StudyQuestion_subtopicId_active_idx" ON "StudyQuestion"("subtopicId", "active");
CREATE INDEX "StudyQuestion_subjectId_idx" ON "StudyQuestion"("subjectId");
CREATE INDEX "StudyAssessmentSession_learnerId_startedAt_idx" ON "StudyAssessmentSession"("learnerId", "startedAt");
CREATE INDEX "StudyQuestionAttempt_learnerId_attemptedAt_idx" ON "StudyQuestionAttempt"("learnerId", "attemptedAt");
CREATE INDEX "StudyQuestionAttempt_questionId_idx" ON "StudyQuestionAttempt"("questionId");
CREATE UNIQUE INDEX "StudyPlanDay_learnerId_planDate_key" ON "StudyPlanDay"("learnerId", "planDate");
CREATE INDEX "StudyPlanItem_planDayId_sortOrder_idx" ON "StudyPlanItem"("planDayId", "sortOrder");

ALTER TABLE "StudyCurriculum" ADD CONSTRAINT "StudyCurriculum_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyTopic" ADD CONSTRAINT "StudyTopic_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "StudyCurriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudySubtopic" ADD CONSTRAINT "StudySubtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "StudyTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyLearner" ADD CONSTRAINT "StudyLearner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudyLearnerSubject" ADD CONSTRAINT "StudyLearnerSubject_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "StudyLearner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyLearnerSubject" ADD CONSTRAINT "StudyLearnerSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyExam" ADD CONSTRAINT "StudyExam_learnerSubjectId_fkey" FOREIGN KEY ("learnerSubjectId") REFERENCES "StudyLearnerSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyMastery" ADD CONSTRAINT "StudyMastery_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "StudyLearner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyMastery" ADD CONSTRAINT "StudyMastery_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "StudySubtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyQuestion" ADD CONSTRAINT "StudyQuestion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "StudySubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyQuestion" ADD CONSTRAINT "StudyQuestion_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "StudySubtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyAssessmentSession" ADD CONSTRAINT "StudyAssessmentSession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "StudyLearner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyAssessmentSession" ADD CONSTRAINT "StudyAssessmentSession_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "StudySubtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyQuestionAttempt" ADD CONSTRAINT "StudyQuestionAttempt_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "StudyLearner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyQuestionAttempt" ADD CONSTRAINT "StudyQuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "StudyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyQuestionAttempt" ADD CONSTRAINT "StudyQuestionAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudyAssessmentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudyPlanDay" ADD CONSTRAINT "StudyPlanDay_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "StudyLearner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyPlanItem" ADD CONSTRAINT "StudyPlanItem_planDayId_fkey" FOREIGN KEY ("planDayId") REFERENCES "StudyPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyPlanItem" ADD CONSTRAINT "StudyPlanItem_learnerSubjectId_fkey" FOREIGN KEY ("learnerSubjectId") REFERENCES "StudyLearnerSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyPlanItem" ADD CONSTRAINT "StudyPlanItem_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "StudySubtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

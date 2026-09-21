-- Official NSC question metadata + short-answer type

ALTER TYPE "StudyQuestionType" ADD VALUE 'SHORT_ANSWER';

ALTER TABLE "StudyQuestion" ADD COLUMN "sourcePaperNumber" INTEGER;
ALTER TABLE "StudyQuestion" ADD COLUMN "sourceQuestionRef" TEXT;
ALTER TABLE "StudyQuestion" ADD COLUMN "officialSourceUrl" TEXT;
ALTER TABLE "StudyQuestion" ADD COLUMN "correctAnswerText" TEXT;
ALTER TABLE "StudyQuestion" ADD COLUMN "acceptableAnswers" JSONB;

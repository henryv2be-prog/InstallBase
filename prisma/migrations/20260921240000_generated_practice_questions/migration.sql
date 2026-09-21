-- Generated practice (parametric, verified) — distinct from hand-written PRACTICE and official NSC.

ALTER TYPE "StudyContentSourceKind" ADD VALUE 'GENERATED_PRACTICE';

ALTER TABLE "StudyQuestion" ADD COLUMN IF NOT EXISTS "generatorMeta" JSONB;

CREATE INDEX IF NOT EXISTS "StudyQuestion_sourceKind_subtopicId_idx"
  ON "StudyQuestion"("sourceKind", "subtopicId");

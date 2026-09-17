-- CreateEnum
CREATE TYPE "MemberTier" AS ENUM ('FOUNDING_MEMBER', 'EARLY_BUILDER');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "memberTier" "MemberTier";

-- Backfill first 50 users by signup date
WITH ranked AS (
  SELECT u.id AS "userId", ROW_NUMBER() OVER (ORDER BY u."createdAt" ASC) AS rank
  FROM "User" u
)
UPDATE "Profile" p
SET "memberTier" = CASE
  WHEN r.rank <= 10 THEN 'FOUNDING_MEMBER'::"MemberTier"
  WHEN r.rank <= 50 THEN 'EARLY_BUILDER'::"MemberTier"
  ELSE NULL
END
FROM ranked r
WHERE p."userId" = r."userId" AND r.rank <= 50;

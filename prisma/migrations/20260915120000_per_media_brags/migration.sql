-- Per-media brags: one brag point per photo/video per user. Remove post-level likes.

-- Add bragScore to PostMedia
ALTER TABLE "PostMedia" ADD COLUMN "bragScore" INTEGER NOT NULL DEFAULT 0;

-- Create MediaBragPoint table
CREATE TABLE "MediaBragPoint" (
    "id" TEXT NOT NULL,
    "postMediaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaBragPoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaBragPoint_postMediaId_userId_key" ON "MediaBragPoint"("postMediaId", "userId");
CREATE INDEX "MediaBragPoint_postMediaId_idx" ON "MediaBragPoint"("postMediaId");
CREATE INDEX "MediaBragPoint_userId_idx" ON "MediaBragPoint"("userId");

ALTER TABLE "MediaBragPoint" ADD CONSTRAINT "MediaBragPoint_postMediaId_fkey" FOREIGN KEY ("postMediaId") REFERENCES "PostMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaBragPoint" ADD CONSTRAINT "MediaBragPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing BragPoint rows to first media item of each post
INSERT INTO "MediaBragPoint" ("id", "postMediaId", "userId", "createdAt")
SELECT
    bp."id",
    first_media.id,
    bp."userId",
    bp."createdAt"
FROM "BragPoint" bp
INNER JOIN LATERAL (
    SELECT pm.id
    FROM "PostMedia" pm
    WHERE pm."postId" = bp."postId"
    ORDER BY pm."order" ASC, pm."createdAt" ASC
    LIMIT 1
) first_media ON true
ON CONFLICT ("postMediaId", "userId") DO NOTHING;

-- Reconcile PostMedia.bragScore from MediaBragPoint counts
UPDATE "PostMedia" pm
SET "bragScore" = counts.cnt
FROM (
    SELECT "postMediaId", COUNT(*)::int AS cnt
    FROM "MediaBragPoint"
    GROUP BY "postMediaId"
) counts
WHERE pm.id = counts."postMediaId";

-- Reconcile Post.bragScore as sum of media brag scores
UPDATE "Post" p
SET "bragScore" = COALESCE(media_totals.total, 0)
FROM (
    SELECT "postId", SUM("bragScore")::int AS total
    FROM "PostMedia"
    GROUP BY "postId"
) media_totals
WHERE p.id = media_totals."postId";

-- Drop post-level engagement tables
DROP TABLE "Like";
DROP TABLE "BragPoint";

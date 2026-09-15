-- CreateTable
CREATE TABLE "PageViewEvent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "viewerKey" TEXT,
    "deviceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageViewDailyStats" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PageViewDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageViewEvent_pageKey_createdAt_idx" ON "PageViewEvent"("pageKey", "createdAt");

-- CreateIndex
CREATE INDEX "PageViewEvent_viewerKey_pageKey_createdAt_idx" ON "PageViewEvent"("viewerKey", "pageKey", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageViewDailyStats_pageKey_date_key" ON "PageViewDailyStats"("pageKey", "date");

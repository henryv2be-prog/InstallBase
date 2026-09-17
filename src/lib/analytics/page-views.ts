import "server-only";
import { prisma } from "@/lib/prisma";
import { LANDING_PAGE_KEY } from "@/lib/constants";

const DEDUP_WINDOW_MS = 30 * 60 * 1000;

function startOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function isDuplicateView(pageKey: string, viewerKey: string | undefined) {
  if (!viewerKey) return false;
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);
  const existing = await prisma.pageViewEvent.findFirst({
    where: {
      pageKey,
      viewerKey,
      createdAt: { gte: since },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function recordPageView(input: {
  pageKey: string;
  viewerKey?: string;
  deviceType?: string;
}) {
  const duplicate = await isDuplicateView(input.pageKey, input.viewerKey);
  if (duplicate) return { recorded: false, duplicate: true };

  const isUnique = input.viewerKey
    ? !(await prisma.pageViewEvent.findFirst({
        where: {
          pageKey: input.pageKey,
          viewerKey: input.viewerKey,
        },
        select: { id: true },
      }))
    : false;

  const today = startOfDay();

  await prisma.$transaction([
    prisma.pageViewEvent.create({
      data: {
        pageKey: input.pageKey,
        viewerKey: input.viewerKey?.slice(0, 64),
        deviceType: input.deviceType?.slice(0, 32),
      },
    }),
    prisma.pageViewDailyStats.upsert({
      where: {
        pageKey_date: {
          pageKey: input.pageKey,
          date: today,
        },
      },
      create: {
        pageKey: input.pageKey,
        date: today,
        views: 1,
        uniqueViews: isUnique ? 1 : 0,
      },
      update: {
        views: { increment: 1 },
        uniqueViews: isUnique ? { increment: 1 } : undefined,
      },
    }),
  ]);

  return { recorded: true };
}

export async function getLandingPageStats() {
  const sevenDaysAgo = startOfDay(new Date(Date.now() - 6 * 86400000));
  const today = startOfDay();

  const [weekAgg, todayRow, allTimeAgg] = await Promise.all([
    prisma.pageViewDailyStats.aggregate({
      where: { pageKey: LANDING_PAGE_KEY, date: { gte: sevenDaysAgo } },
      _sum: { views: true, uniqueViews: true },
    }),
    prisma.pageViewDailyStats.findUnique({
      where: { pageKey_date: { pageKey: LANDING_PAGE_KEY, date: today } },
      select: { views: true, uniqueViews: true },
    }),
    prisma.pageViewDailyStats.aggregate({
      where: { pageKey: LANDING_PAGE_KEY },
      _sum: { views: true, uniqueViews: true },
    }),
  ]);

  return {
    viewsToday: todayRow?.views ?? 0,
    uniqueVisitorsToday: todayRow?.uniqueViews ?? 0,
    viewsWeek: weekAgg._sum.views ?? 0,
    uniqueVisitorsWeek: weekAgg._sum.uniqueViews ?? 0,
    viewsAllTime: allTimeAgg._sum.views ?? 0,
    uniqueVisitorsAllTime: allTimeAgg._sum.uniqueViews ?? 0,
  };
}

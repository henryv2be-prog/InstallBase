import type { Prisma } from "@/generated/prisma/client";

/** Draft install-video posts stay hidden until the user publishes. */
export const publishedFeedWhere = { published: true } satisfies Prisma.PostWhereInput;

/** New look / immersive reel — only posts with viewable install media. */
export const immersiveFeedWhere = {
  ...publishedFeedWhere,
  media: { some: {} },
} satisfies Prisma.PostWhereInput;

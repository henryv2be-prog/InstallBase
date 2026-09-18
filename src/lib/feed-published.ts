import type { Prisma } from "@/generated/prisma/client";

/** Draft install-video posts stay hidden until the user publishes. */
export const publishedFeedWhere = { published: true } satisfies Prisma.PostWhereInput;

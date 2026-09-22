import "server-only";
import { prisma } from "@/lib/prisma";
import { kickVideoCompilationQueue } from "@/lib/video-compilation/queue";
import {
  compactWorkDetails,
  computeDefaultInPortfolio,
  resolveComposerIntent,
} from "@/lib/work-posts";
import { slugify } from "@/lib/utils";
import type { PostType } from "@/generated/prisma/client";
import {
  DEFAULT_VIDEO_COMPILATION_OPTIONS,
  parseVideoCompilationOptions,
  type VideoCompilationOptions,
} from "@/lib/video-compilation/options";

export type InstallVideoMediaInput = {
  url: string;
  type: "image" | "video";
  order: number;
};

export type InstallVideoDraftInput = {
  content: string;
  title?: string;
  postIntent: string;
  location?: string;
  showExactLocation: boolean;
  workTrade?: string;
  workProjectType?: string;
  workDeviceCount?: string;
  workDate?: string;
  workEquipmentNotes?: string;
  type?: PostType;
};

async function resolveCategoryIdForTrade(trade: string | undefined) {
  const trimmed = trade?.trim();
  if (!trimmed) return null;
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ name: { equals: trimmed, mode: "insensitive" } }, { slug: slugify(trimmed) }],
    },
    select: { id: true },
  });
  return category?.id ?? null;
}

export async function upsertInstallVideoDraft(
  authorId: string,
  media: InstallVideoMediaInput[],
  input: InstallVideoDraftInput,
  existingPostId?: string,
  compilationOptions: VideoCompilationOptions = DEFAULT_VIDEO_COMPILATION_OPTIONS
) {
  const videoOptions = parseVideoCompilationOptions(compilationOptions);
  const type = input.type ?? "POST";
  const postIntent = resolveComposerIntent(type, input.postIntent);
  const inPortfolio = computeDefaultInPortfolio(type, postIntent);
  const workDateRaw = input.workDate?.trim();
  const workDate = workDateRaw ? new Date(workDateRaw) : null;
  const workDetails = compactWorkDetails({
    trade: input.workTrade?.trim() || undefined,
    projectType: input.workProjectType?.trim() || undefined,
    deviceCount: input.workDeviceCount?.trim() || undefined,
    equipmentNotes: input.workEquipmentNotes?.trim() || undefined,
  });
  const categoryId = await resolveCategoryIdForTrade(input.workTrade);

  const ordered = [...media].sort((a, b) => a.order - b.order);

  let postId = existingPostId;

  if (postId) {
    const existing = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, published: true },
    });
    if (!existing || existing.authorId !== authorId) {
      throw new Error("You can only edit your own draft");
    }

    await prisma.$transaction(async (tx) => {
      await tx.postMedia.deleteMany({ where: { postId, mediaRole: "SOURCE" } });
      await tx.postMedia.deleteMany({ where: { postId, mediaRole: "COMPILED" } });
      await tx.postCategory.deleteMany({ where: { postId } });
      if (categoryId) {
        await tx.postCategory.create({ data: { postId, categoryId } });
      }
      await tx.post.update({
        where: { id: postId },
        data: {
          content: input.content,
          title: input.title || null,
          postIntent,
          inPortfolio,
          location: input.location?.trim() || null,
          showExactLocation: input.showExactLocation,
          workDate: workDate && !Number.isNaN(workDate.getTime()) ? workDate : null,
          workDetails: workDetails ?? undefined,
          published: false,
          videoCompilationStatus: "QUEUED",
          generatedVideoUrl: null,
          generatedVideoPosterUrl: null,
          videoCompilationError: null,
          videoCompilationOptions: videoOptions,
          media: {
            create: ordered.map((item, index) => ({
              url: item.url,
              type: item.type,
              mediaRole: "SOURCE",
              order: index,
            })),
          },
        },
      });
    });
  } else {
    const post = await prisma.post.create({
      data: {
        authorId,
        type,
        postIntent,
        content: input.content,
        title: input.title || undefined,
        location: input.location?.trim() || undefined,
        workDate: workDate && !Number.isNaN(workDate.getTime()) ? workDate : undefined,
        workDetails: workDetails ?? undefined,
        showExactLocation: input.showExactLocation,
        inPortfolio,
        published: false,
        videoCompilationStatus: "QUEUED",
        videoCompilationOptions: videoOptions,
        bragScore: 0,
        media: {
          create: ordered.map((item, index) => ({
            url: item.url,
            type: item.type,
            mediaRole: "SOURCE",
            order: index,
          })),
        },
        categories: categoryId ? { create: [{ categoryId }] } : undefined,
      },
    });
    postId = post.id;
  }

  kickVideoCompilationQueue();
  return { postId };
}

export async function queueInstallVideoRegeneration(authorId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  if (!post || post.authorId !== authorId) {
    throw new Error("You can only edit your own draft");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      videoCompilationStatus: "QUEUED",
      videoCompilationError: null,
      generatedVideoUrl: null,
      generatedVideoPosterUrl: null,
    },
  });
  await prisma.postMedia.deleteMany({ where: { postId, mediaRole: "COMPILED" } });
  kickVideoCompilationQueue();
}

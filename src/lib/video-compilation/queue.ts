import "server-only";
import { prisma } from "@/lib/prisma";
import { compileInstallationVideo } from "@/lib/video-compilation/compile";
import { logFfmpegAvailability } from "@/lib/video-compilation/ffmpeg-path";
import { userFacingCompilationError } from "@/lib/video-compilation/user-error";
import { revalidatePath } from "next/cache";

const GLOBAL_KEY = "__installbaseVideoCompilationQueue";

type QueueState = {
  running: boolean;
};

function getState(): QueueState {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: QueueState };
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = { running: false };
  return g[GLOBAL_KEY]!;
}

async function claimNextQueuedPostId(): Promise<string | null> {
  for (;;) {
    const next = await prisma.post.findFirst({
      where: { videoCompilationStatus: "QUEUED" },
      orderBy: { updatedAt: "asc" },
      select: { id: true },
    });
    if (!next) return null;

    const claimed = await prisma.post.updateMany({
      where: { id: next.id, videoCompilationStatus: "QUEUED" },
      data: { videoCompilationStatus: "PROCESSING" },
    });
    if (claimed.count === 1) return next.id;
  }
}

export function kickVideoCompilationQueue() {
  const state = getState();
  if (state.running) return;
  state.running = true;
  void drainQueue().finally(() => {
    state.running = false;
    void claimNextQueuedPostId().then((pending) => {
      if (pending) kickVideoCompilationQueue();
    });
  });
}

async function drainQueue() {
  for (;;) {
    const postId = await claimNextQueuedPostId();
    if (!postId) return;

    const processing = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: {
          where: { mediaRole: "SOURCE" },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!processing) continue;

    try {
      const sources = processing.media.map((item) => ({
        url: item.url,
        type: item.type === "video" ? ("video" as const) : ("image" as const),
        order: item.order,
      }));

      if (sources.length === 0) {
        throw new Error("Add at least one photo or video");
      }

      const { videoUrl, posterUrl } = await compileInstallationVideo(sources);

      await prisma.$transaction(async (tx) => {
        await tx.postMedia.deleteMany({
          where: { postId: processing.id, mediaRole: "COMPILED" },
        });
        await tx.postMedia.create({
          data: {
            postId: processing.id,
            url: videoUrl,
            type: "video",
            mediaRole: "COMPILED",
            order: 9999,
          },
        });
        await tx.post.update({
          where: { id: processing.id },
          data: {
            videoCompilationStatus: "READY",
            generatedVideoUrl: videoUrl,
            generatedVideoPosterUrl: posterUrl,
            videoCompilationError: null,
            type: "VIDEO",
          },
        });
      });

      revalidatePath(`/post/${processing.id}`);
    } catch (error) {
      const message = userFacingCompilationError(error);
      await prisma.post.update({
        where: { id: postId },
        data: {
          videoCompilationStatus: "FAILED",
          videoCompilationError: message,
        },
      });
    }
  }
}

export function startVideoCompilationScheduler() {
  logFfmpegAvailability();
  kickVideoCompilationQueue();
}

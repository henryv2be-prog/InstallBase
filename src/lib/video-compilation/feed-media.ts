import type { PostMediaWithViewerState } from "@/lib/queries";
import type { VideoCompilationStatus } from "@/generated/prisma/client";

type PostCompilationFields = {
  videoCompilationStatus: VideoCompilationStatus;
  generatedVideoUrl: string | null;
  generatedVideoPosterUrl: string | null;
  media: PostMediaWithViewerState[];
};

/** Feed/detail display: show the compiled vertical video, not every source file. */
export function mediaForFeedDisplay(post: PostCompilationFields): PostMediaWithViewerState[] {
  if (post.videoCompilationStatus === "READY" && post.generatedVideoUrl) {
    const compiled = post.media.find((item) => item.mediaRole === "COMPILED");
    if (compiled) return [compiled];
    return [
      {
        id: "compiled",
        postId: "",
        url: post.generatedVideoUrl,
        type: "video",
        mediaRole: "COMPILED",
        caption: null,
        order: 0,
        bragScore: 0,
        createdAt: new Date(),
        braggedByViewer: false,
      },
    ];
  }
  return post.media.filter((item) => item.mediaRole !== "COMPILED");
}

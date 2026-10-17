import type { PostCardData } from "@/lib/queries";
import { isVideoMedia } from "@/lib/media";
import { parseVideoCompilationOptions } from "@/lib/video-compilation/options";

/** Whether the feed should try unmuted autoplay (browser may still require a tap). */
export function postPrefersUnmutedPlayback(post: PostCardData): boolean {
  if (post.videoCompilationStatus === "READY" && post.generatedVideoUrl) {
    const options = parseVideoCompilationOptions(post.videoCompilationOptions);
    return options.audio !== "none";
  }

  const sources = post.media.filter((item) => item.mediaRole !== "COMPILED");
  const hasUserVideo = sources.some((item) => isVideoMedia(item.type, item.url));
  if (hasUserVideo && post.type !== "QUESTION") {
    return true;
  }

  return post.type === "VIDEO";
}

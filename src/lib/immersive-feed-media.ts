import type { PostCardData } from "@/lib/queries";
import { mediaForFeedDisplay } from "@/lib/video-compilation/feed-media";
import { isVideoMedia } from "@/lib/media";

/** Media shown in the immersive viewer (compiled video or source install photos). */
export function mediaForImmersiveDisplay(post: PostCardData) {
  if (post.videoCompilationStatus === "READY" && post.generatedVideoUrl) {
    return mediaForFeedDisplay(post);
  }

  const sources = post.media
    .filter((item) => item.mediaRole !== "COMPILED")
    .sort((a, b) => a.order - b.order);

  if (sources.length > 0) return sources;
  return post.media.filter((item) => item.mediaRole !== "COMPILED");
}

export function postHasImmersiveMedia(post: PostCardData) {
  return mediaForImmersiveDisplay(post).length > 0;
}

/** Original install photos/videos used to build a compiled post (excludes COMPILED output). */
export function sourceInstallMediaForPost(post: PostCardData) {
  return post.media
    .filter((item) => item.mediaRole !== "COMPILED")
    .sort((a, b) => a.order - b.order);
}

export function sourceInstallPhotoUrlsForPost(post: PostCardData) {
  return sourceInstallMediaForPost(post)
    .filter((item) => !isVideoMedia(item.type, item.url))
    .map((item) => item.url);
}

export function isReadyCompiledInstallVideo(post: PostCardData) {
  return post.videoCompilationStatus === "READY" && Boolean(post.generatedVideoUrl);
}

export function primaryImmersiveMediaKind(post: PostCardData) {
  const media = mediaForImmersiveDisplay(post);
  if (media.length === 0) return "none" as const;
  if (media.length === 1 && isVideoMedia(media[0].type, media[0].url)) return "video" as const;
  if (media.every((item) => isVideoMedia(item.type, item.url))) return "video" as const;
  if (media.length === 1) return "single-photo" as const;
  return "photo-story" as const;
}

"use client";

import type { PostCardData } from "@/lib/queries";
import {
  isReadyCompiledInstallVideo,
  mediaForImmersiveDisplay,
  postHasImmersiveSoundtrack,
  primaryImmersiveMediaKind,
  sourceInstallPhotoUrlsForPost,
} from "@/lib/immersive-feed-media";
import { ImmersiveInstallPhotoWithMusic } from "@/components/feed/immersive/immersive-install-photo-with-music";
import { ImmersivePhotoStoryWithMusic } from "@/components/feed/immersive/immersive-photo-story-with-music";
import { isVideoMedia } from "@/lib/media";
import { ImmersivePhotoStory } from "@/components/feed/immersive/immersive-photo-story";
import { ImmersiveVideoPlayer } from "@/components/feed/immersive/immersive-video-player";
import { ImmersiveInstallPhoto } from "@/components/feed/immersive/immersive-install-photo";
import { ImmersiveCompiledInstallVideo } from "@/components/feed/immersive/immersive-compiled-install-video";
import { postPrefersUnmutedPlayback } from "@/lib/post-video-audio";

interface ImmersiveMediaStageProps {
  post: PostCardData;
  active: boolean;
}

export function ImmersiveMediaStage({ post, active }: ImmersiveMediaStageProps) {
  const media = mediaForImmersiveDisplay(post);
  const kind = primaryImmersiveMediaKind(post);
  const preferUnmuted = postPrefersUnmutedPlayback(post);

  if (media.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center text-white/80">
        <p className="line-clamp-6 text-lg">{post.content || "Installation post"}</p>
      </div>
    );
  }

  if (isReadyCompiledInstallVideo(post)) {
    return (
      <ImmersiveCompiledInstallVideo
        videoUrl={post.generatedVideoUrl!}
        posterUrl={post.generatedVideoPosterUrl}
        sourcePhotoUrls={sourceInstallPhotoUrlsForPost(post)}
        videoCompilationOptions={post.videoCompilationOptions}
        active={active}
        className="h-full w-full"
      />
    );
  }

  if (kind === "video" || (media.length === 1 && isVideoMedia(media[0].type, media[0].url))) {
    const item = media[0];
    const poster =
      post.generatedVideoPosterUrl ??
      (post.videoCompilationStatus === "READY" ? post.generatedVideoPosterUrl : null);
    return (
      <ImmersiveVideoPlayer
        url={post.generatedVideoUrl ?? item.url}
        posterUrl={poster}
        active={active}
        preferUnmuted={preferUnmuted}
        className="h-full w-full"
      />
    );
  }

  if (kind === "single-photo") {
    if (postHasImmersiveSoundtrack(post)) {
      return (
        <ImmersiveInstallPhotoWithMusic
          photoUrl={media[0].url}
          videoCompilationOptions={post.videoCompilationOptions}
          active={active}
          className="h-full w-full"
        />
      );
    }
    return (
      <ImmersiveInstallPhoto src={media[0].url} active={active} className="h-full w-full" />
    );
  }

  const photoUrls = media.filter((item) => !isVideoMedia(item.type, item.url)).map((item) => item.url);
  const videos = media.filter((item) => isVideoMedia(item.type, item.url));

  if (videos.length > 0 && photoUrls.length === 0) {
    return (
      <ImmersiveVideoPlayer
        url={videos[0].url}
        active={active}
        preferUnmuted={preferUnmuted}
        className="h-full w-full"
      />
    );
  }

  if (photoUrls.length > 0) {
    if (postHasImmersiveSoundtrack(post)) {
      return (
        <ImmersivePhotoStoryWithMusic
          urls={photoUrls}
          videoCompilationOptions={post.videoCompilationOptions}
          active={active}
          className="h-full w-full"
        />
      );
    }
    return <ImmersivePhotoStory urls={photoUrls} active={active} className="h-full w-full" />;
  }

  return null;
}

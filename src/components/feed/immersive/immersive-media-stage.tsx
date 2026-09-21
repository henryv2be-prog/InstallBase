"use client";

import type { PostCardData } from "@/lib/queries";
import {
  mediaForImmersiveDisplay,
  primaryImmersiveMediaKind,
} from "@/lib/immersive-feed-media";
import { isVideoMedia } from "@/lib/media";
import { ImmersivePhotoStory } from "@/components/feed/immersive/immersive-photo-story";
import { ImmersiveVideoPlayer } from "@/components/feed/immersive/immersive-video-player";
import { ImmersiveInstallPhoto } from "@/components/feed/immersive/immersive-install-photo";

interface ImmersiveMediaStageProps {
  post: PostCardData;
  active: boolean;
}

export function ImmersiveMediaStage({ post, active }: ImmersiveMediaStageProps) {
  const media = mediaForImmersiveDisplay(post);
  const kind = primaryImmersiveMediaKind(post);

  if (media.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center text-white/80">
        <p className="line-clamp-6 text-lg">{post.content || "Installation post"}</p>
      </div>
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
        className="h-full w-full"
      />
    );
  }

  if (kind === "single-photo") {
    return (
      <ImmersiveInstallPhoto src={media[0].url} active={active} className="h-full w-full" />
    );
  }

  const photoUrls = media.filter((item) => !isVideoMedia(item.type, item.url)).map((item) => item.url);
  const videos = media.filter((item) => isVideoMedia(item.type, item.url));

  if (videos.length > 0 && photoUrls.length === 0) {
    return <ImmersiveVideoPlayer url={videos[0].url} active={active} className="h-full w-full" />;
  }

  if (photoUrls.length > 0) {
    return <ImmersivePhotoStory urls={photoUrls} active={active} className="h-full w-full" />;
  }

  return null;
}

"use client";

import { ImmersivePhotoStory } from "@/components/feed/immersive/immersive-photo-story";
import { ImmersiveInstallPhotoWithMusic } from "@/components/feed/immersive/immersive-install-photo-with-music";
import { ImmersiveSoundtrackControls } from "@/components/feed/immersive/immersive-soundtrack-controls";
import { useImmersiveSoundtrack } from "@/components/feed/immersive/use-immersive-soundtrack";
import { cn } from "@/lib/utils";

interface ImmersivePhotoStoryWithMusicProps {
  urls: string[];
  videoCompilationOptions: unknown;
  active: boolean;
  className?: string;
}

/** Multi-photo carousel with library soundtrack in the New look reel. */
export function ImmersivePhotoStoryWithMusic({
  urls,
  videoCompilationOptions,
  active,
  className,
}: ImmersivePhotoStoryWithMusicProps) {
  if (urls.length === 1) {
    return (
      <ImmersiveInstallPhotoWithMusic
        photoUrl={urls[0]!}
        videoCompilationOptions={videoCompilationOptions}
        active={active}
        className={className}
      />
    );
  }

  const { audioRef, audioSrc, playing, muted, togglePlay, toggleMute } = useImmersiveSoundtrack(
    videoCompilationOptions,
    active
  );

  return (
    <div className={cn("relative h-full w-full bg-black", className)}>
      <ImmersivePhotoStory urls={urls} active={active && (playing || !audioSrc)} className="h-full w-full" />
      {audioSrc ? <audio ref={audioRef} src={audioSrc} preload="auto" className="hidden" /> : null}
      {audioSrc ? (
        <ImmersiveSoundtrackControls
          playing={playing}
          muted={muted}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
        />
      ) : null}
    </div>
  );
}

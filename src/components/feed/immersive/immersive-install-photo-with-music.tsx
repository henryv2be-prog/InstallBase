"use client";

import { cn } from "@/lib/utils";
import { ImmersiveInstallPhoto } from "@/components/feed/immersive/immersive-install-photo";
import { ImmersiveSoundtrackControls } from "@/components/feed/immersive/immersive-soundtrack-controls";
import { useImmersiveSoundtrack } from "@/components/feed/immersive/use-immersive-soundtrack";

interface ImmersiveInstallPhotoWithMusicProps {
  photoUrl: string;
  videoCompilationOptions: unknown;
  active: boolean;
  className?: string;
}

/** Ken-burns install photo with optional library soundtrack (photo posts without a compiled MP4). */
export function ImmersiveInstallPhotoWithMusic({
  photoUrl,
  videoCompilationOptions,
  active,
  className,
}: ImmersiveInstallPhotoWithMusicProps) {
  const { audioRef, audioSrc, playing, muted, togglePlay, toggleMute } = useImmersiveSoundtrack(
    videoCompilationOptions,
    active
  );

  if (!audioSrc) {
    return <ImmersiveInstallPhoto src={photoUrl} active={active} kenBurns className={className} />;
  }

  return (
    <div className={cn("relative h-full w-full bg-black", className)}>
      <ImmersiveInstallPhoto src={photoUrl} active={active && playing} kenBurns className="h-full w-full" />
      <audio ref={audioRef} src={audioSrc} preload="auto" className="hidden" />
      <ImmersiveSoundtrackControls
        playing={playing}
        muted={muted}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Loader2, Music2, VolumeX } from "lucide-react";
import { previewUrlForTrack } from "@/lib/video-compilation/sound-tracks";
import { Button } from "@/components/ui/button";
import { CreateVideoStyleLivePreview } from "@/components/feed/create-video-style-live-preview";
import { VideoWithMusicPreview } from "@/components/feed/video-with-music-preview";
import { GlassPickerChip, GlassPickerShell } from "@/components/feed/create-flow/glass-horizontal-picker";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import type { VideoCompilationStyleId } from "@/lib/video-compilation/style-presets";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";

interface MusicStepProps {
  videoUrl: string | null;
  posterUrl: string | null;
  compilationStatus: CompilationStatus;
  compilationError: string | null;
  previewImageUrls: string[];
  styleId: VideoCompilationStyleId;
  selectedAudio: VideoCompilationAudioSelection;
  onAudioChange: (audio: VideoCompilationAudioSelection) => void;
  tracks: VideoSoundTrackClient[];
  tracksLoading: boolean;
  onContinue: () => void;
  onRetryRender: () => void;
  continueDisabled?: boolean;
}

export function CreateFlowMusicStep({
  videoUrl,
  posterUrl,
  compilationStatus,
  compilationError,
  previewImageUrls,
  styleId,
  selectedAudio,
  onAudioChange,
  tracks,
  tracksLoading,
  onContinue,
  onRetryRender,
  continueDisabled,
}: MusicStepProps) {
  const rendering = compilationStatus === "QUEUED" || compilationStatus === "PROCESSING";
  const failed = compilationStatus === "FAILED";
  const hdReady = compilationStatus === "READY" && videoUrl;
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (hdReady) return;
    const audio = audioPreviewRef.current;
    if (!audio) return;
    const track = selectedAudio === "none" ? null : tracks.find((t) => t.id === selectedAudio) ?? null;
    const src = previewUrlForTrack(track);
    if (!src) {
      audio.pause();
      return;
    }
    if (audio.src !== new URL(src, window.location.origin).href) {
      audio.src = src;
    }
    audio.loop = true;
    void audio.play().catch(() => undefined);
    return () => {
      audio.pause();
    };
  }, [hdReady, selectedAudio, tracks]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-0 bg-black">
        {!hdReady && selectedAudio !== "none" ? (
          <audio ref={audioPreviewRef} className="hidden" preload="auto" />
        ) : null}
        {hdReady ? (
          <VideoWithMusicPreview
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            audioId={selectedAudio}
            tracks={tracks}
            edgeToEdge
            className="h-full max-w-none"
          />
        ) : (
          <>
            <CreateVideoStyleLivePreview
              styleId={styleId}
              imageUrls={previewImageUrls}
              immersive
              className="h-full opacity-90"
            />
            {rendering && (
              <div className="absolute inset-x-0 top-[max(3.5rem,env(safe-area-inset-top))] z-10 flex justify-center px-4">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-sm text-white backdrop-blur-md">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Rendering HD video…
                </div>
              </div>
            )}
            {failed && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center">
                <p className="text-sm text-white">{compilationError ?? "Could not render video"}</p>
                <Button type="button" variant="secondary" onClick={onRetryRender}>
                  Try again
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pointer-events-none relative z-20 mt-auto space-y-3 px-3 pb-[calc(var(--app-mobile-bottom-clearance)+1rem)] pt-20">
        <div className="pointer-events-auto">
          <GlassPickerShell label="Music">
            {tracksLoading ? (
              <div className="flex items-center gap-2 px-2 py-3 text-sm text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tracks…
              </div>
            ) : (
              <>
                <GlassPickerChip
                  active={selectedAudio === "none"}
                  label="Original"
                  sub="No music"
                  icon={<VolumeX className="h-5 w-5" />}
                  onClick={() => onAudioChange("none")}
                />
                {tracks.map((track) => (
                  <GlassPickerChip
                    key={track.id}
                    active={selectedAudio === track.id}
                    label={track.label}
                    sub={track.tag}
                    icon={<Music2 className="h-5 w-5" />}
                    onClick={() => onAudioChange(track.id)}
                  />
                ))}
              </>
            )}
          </GlassPickerShell>
        </div>
        {!hdReady && !failed && (
          <p className="text-center text-[11px] text-white/55">
            Pick a track now — preview syncs when HD video is ready.
          </p>
        )}
        <Button
          type="button"
          className="pointer-events-auto min-h-12 w-full touch-manipulation"
          onClick={onContinue}
          disabled={continueDisabled || tracksLoading || !hdReady || failed}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

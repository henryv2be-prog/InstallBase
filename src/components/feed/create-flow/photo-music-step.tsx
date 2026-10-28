"use client";

import { useEffect, useRef } from "react";
import { Loader2, Music2, Volume2 } from "lucide-react";
import { previewUrlForTrack } from "@/lib/video-compilation/sound-tracks";
import { Button } from "@/components/ui/button";
import { CreateVideoStyleLivePreview } from "@/components/feed/create-video-style-live-preview";
import { GlassPickerChip, GlassPickerShell } from "@/components/feed/create-flow/glass-horizontal-picker";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";
import { DEFAULT_VIDEO_COMPILATION_OPTIONS } from "@/lib/video-compilation/options";

interface PhotoMusicStepProps {
  previewImageUrls: string[];
  selectedAudio: VideoCompilationAudioSelection;
  onAudioChange: (audio: VideoCompilationAudioSelection) => void;
  tracks: VideoSoundTrackClient[];
  tracksLoading: boolean;
  onContinue: () => void;
}

export function CreateFlowPhotoMusicStep({
  previewImageUrls,
  selectedAudio,
  onAudioChange,
  tracks,
  tracksLoading,
  onContinue,
}: PhotoMusicStepProps) {
  const styleId = DEFAULT_VIDEO_COMPILATION_OPTIONS.style;
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
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
  }, [selectedAudio, tracks]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-0 bg-black">
        {selectedAudio !== "none" ? (
          <audio ref={audioPreviewRef} className="hidden" preload="auto" />
        ) : null}
        <CreateVideoStyleLivePreview
          styleId={styleId}
          imageUrls={previewImageUrls}
          immersive
          className="h-full opacity-95"
        />
      </div>

      <div className="pointer-events-none relative z-20 mt-auto space-y-3 px-3 pb-[calc(var(--app-mobile-bottom-clearance)+1rem)] pt-20">
        <div className="pointer-events-auto">
          <GlassPickerShell label="Soundtrack">
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
                  sub="Silent photo"
                  icon={<Volume2 className="h-5 w-5" />}
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
        <p className="text-center text-[11px] text-white/55">
          Music plays in the New look reel. You can also create a full install video from the previous step.
        </p>
        <Button
          type="button"
          className="pointer-events-auto min-h-12 w-full touch-manipulation"
          onClick={onContinue}
          disabled={tracksLoading}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

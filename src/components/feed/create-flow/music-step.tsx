"use client";

import { Loader2, Music2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoWithMusicPreview } from "@/components/feed/video-with-music-preview";
import { GlassPickerChip, GlassPickerShell } from "@/components/feed/create-flow/glass-horizontal-picker";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";

interface MusicStepProps {
  videoUrl: string;
  posterUrl: string | null;
  selectedAudio: VideoCompilationAudioSelection;
  onAudioChange: (audio: VideoCompilationAudioSelection) => void;
  tracks: VideoSoundTrackClient[];
  tracksLoading: boolean;
  onContinue: () => void;
  continueDisabled?: boolean;
}

export function CreateFlowMusicStep({
  videoUrl,
  posterUrl,
  selectedAudio,
  onAudioChange,
  tracks,
  tracksLoading,
  onContinue,
  continueDisabled,
}: MusicStepProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-0 bg-black">
        <VideoWithMusicPreview
          videoUrl={videoUrl}
          posterUrl={posterUrl}
          audioId={selectedAudio}
          tracks={tracks}
          edgeToEdge
          className="h-full max-w-none"
        />
      </div>

      <div className="pointer-events-none relative z-20 mt-auto space-y-3 px-3 pb-[calc(var(--app-mobile-bottom-clearance)+0.5rem)] pt-20">
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
        <Button
          type="button"
          className="pointer-events-auto min-h-12 w-full touch-manipulation"
          onClick={onContinue}
          disabled={continueDisabled || tracksLoading}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

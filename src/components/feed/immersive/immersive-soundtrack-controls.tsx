"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface ImmersiveSoundtrackControlsProps {
  playing: boolean;
  muted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

export function ImmersiveSoundtrackControls({
  playing,
  muted,
  onTogglePlay,
  onToggleMute,
}: ImmersiveSoundtrackControlsProps) {
  return (
    <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
      <button
        type="button"
        onClick={onTogglePlay}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
        aria-label={playing ? "Pause music" : "Play music"}
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
      </button>
      <button
        type="button"
        onClick={onToggleMute}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
    </div>
  );
}

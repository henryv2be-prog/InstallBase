import type { VideoCompilationAudioId } from "@/lib/video-compilation/options";

/** Public URL path for browser preview (same files ffmpeg uses server-side). */
export const VIDEO_SOUND_PUBLIC_BASE = "/audio/video-compilation";

type SoundTrackMeta = {
  file: string;
  label: string;
  description: string;
  /** Short tag shown on the sound chip (TikTok-style). */
  tag: string;
};

export const VIDEO_SOUND_TRACKS: Record<
  Exclude<VideoCompilationAudioId, "none">,
  SoundTrackMeta
> = {
  down_to_business: {
    file: "down-to-business.mp3",
    label: "Down to business",
    description: "Hype montage beat — great for install timelapses",
    tag: "Montage",
  },
  install_hype: {
    file: "install-hype.mp3",
    label: "Install hype",
    description: "Fast trap-style energy for quick-cut videos",
    tag: "Hype",
  },
  chill_vlog: {
    file: "chill-vlog.mp3",
    label: "Chill vlog",
    description: "Laid-back background for longer showcases",
    tag: "Vlog",
  },
  epic_montage: {
    file: "epic-montage.mp3",
    label: "Epic montage",
    description: "Builds over time — cinematic finish",
    tag: "Epic",
  },
};

export function previewUrlForAudio(track: VideoCompilationAudioId): string | null {
  if (track === "none") return null;
  const meta = VIDEO_SOUND_TRACKS[track];
  return `${VIDEO_SOUND_PUBLIC_BASE}/${meta.file}`;
}

export function soundtrackRelativeFile(track: VideoCompilationAudioId): string | null {
  if (track === "none") return null;
  return VIDEO_SOUND_TRACKS[track].file;
}

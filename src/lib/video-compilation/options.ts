export const VIDEO_COMPILATION_STYLES = {
  cinematic: {
    label: "Cinematic zoom",
    description: "Slow Ken Burns motion on portrait shots",
    photoDurationSec: 3.5,
    zoom: true,
    zoomStrength: "normal" as const,
    landscapeBlur: true,
  },
  quick: {
    label: "Quick cuts",
    description: "Faster pacing, minimal motion",
    photoDurationSec: 2,
    zoom: false,
    zoomStrength: "normal" as const,
    landscapeBlur: true,
  },
  steady: {
    label: "Steady hold",
    description: "Longer on each photo, calm feel",
    photoDurationSec: 5,
    zoom: false,
    zoomStrength: "normal" as const,
    landscapeBlur: true,
  },
  dramatic: {
    label: "Dramatic zoom",
    description: "Stronger zoom, full-frame crop",
    photoDurationSec: 4,
    zoom: true,
    zoomStrength: "strong" as const,
    landscapeBlur: false,
  },
} as const;

/** Sound ids map to loopable MP3s in public/audio/video-compilation/ */
export const VIDEO_COMPILATION_AUDIO = {
  none: {
    label: "Original",
    description: "No music — video only",
  },
  down_to_business: {
    label: "Down to business",
    description: "Hype montage beat for install timelapses",
  },
  install_hype: {
    label: "Install hype",
    description: "Fast trap-style energy",
  },
  chill_vlog: {
    label: "Chill vlog",
    description: "Laid-back background",
  },
  epic_montage: {
    label: "Epic montage",
    description: "Cinematic build",
  },
} as const;

export type VideoCompilationStyleId = keyof typeof VIDEO_COMPILATION_STYLES;
export type VideoCompilationAudioId = keyof typeof VIDEO_COMPILATION_AUDIO;

export type VideoCompilationOptions = {
  style: VideoCompilationStyleId;
  audio: VideoCompilationAudioId;
};

export const DEFAULT_VIDEO_COMPILATION_OPTIONS: VideoCompilationOptions = {
  style: "cinematic",
  audio: "down_to_business",
};

const STYLE_IDS = new Set<string>(Object.keys(VIDEO_COMPILATION_STYLES));
const AUDIO_IDS = new Set<string>(Object.keys(VIDEO_COMPILATION_AUDIO));

/** Older drafts used synthetic lavfi track ids — map to the new library. */
const LEGACY_AUDIO: Record<string, VideoCompilationAudioId> = {
  ambient: "chill_vlog",
  pulse: "install_hype",
  focus: "epic_montage",
};

export function parseVideoCompilationOptions(raw: unknown): VideoCompilationOptions {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_VIDEO_COMPILATION_OPTIONS };
  }
  const record = raw as Record<string, unknown>;
  const style =
    typeof record.style === "string" && STYLE_IDS.has(record.style)
      ? (record.style as VideoCompilationStyleId)
      : DEFAULT_VIDEO_COMPILATION_OPTIONS.style;
  let audioRaw = typeof record.audio === "string" ? record.audio : "";
  if (LEGACY_AUDIO[audioRaw]) {
    audioRaw = LEGACY_AUDIO[audioRaw];
  }
  const audio =
    audioRaw && AUDIO_IDS.has(audioRaw)
      ? (audioRaw as VideoCompilationAudioId)
      : DEFAULT_VIDEO_COMPILATION_OPTIONS.audio;
  return { style, audio };
}

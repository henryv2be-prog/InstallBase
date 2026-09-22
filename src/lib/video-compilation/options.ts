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

export const VIDEO_COMPILATION_AUDIO = {
  none: {
    label: "No audio",
    description: "Silent video",
  },
  ambient: {
    label: "Soft ambient",
    description: "Gentle background atmosphere",
  },
  pulse: {
    label: "Light pulse",
    description: "Subtle rhythmic undertone",
  },
  focus: {
    label: "Clean minimal",
    description: "Very soft tone for a polished finish",
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
  audio: "ambient",
};

const STYLE_IDS = new Set<string>(Object.keys(VIDEO_COMPILATION_STYLES));
const AUDIO_IDS = new Set<string>(Object.keys(VIDEO_COMPILATION_AUDIO));

export function parseVideoCompilationOptions(raw: unknown): VideoCompilationOptions {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_VIDEO_COMPILATION_OPTIONS };
  }
  const record = raw as Record<string, unknown>;
  const style =
    typeof record.style === "string" && STYLE_IDS.has(record.style)
      ? (record.style as VideoCompilationStyleId)
      : DEFAULT_VIDEO_COMPILATION_OPTIONS.style;
  const audio =
    typeof record.audio === "string" && AUDIO_IDS.has(record.audio)
      ? (record.audio as VideoCompilationAudioId)
      : DEFAULT_VIDEO_COMPILATION_OPTIONS.audio;
  return { style, audio };
}

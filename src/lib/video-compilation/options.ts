import {
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationStyleId,
} from "@/lib/video-compilation/style-presets";

export { VIDEO_COMPILATION_STYLES, type VideoCompilationStyleId };

/** `none` = silent; otherwise id matches mp3 basename in public/audio/video-compilation/ */
export type VideoCompilationAudioSelection = "none" | string;

export type VideoCompilationOptions = {
  style: VideoCompilationStyleId;
  audio: VideoCompilationAudioSelection;
};

export const DEFAULT_VIDEO_COMPILATION_OPTIONS: VideoCompilationOptions = {
  style: "cinematic",
  audio: "none",
};

const STYLE_IDS = new Set<string>(Object.keys(VIDEO_COMPILATION_STYLES));

/** Map old enum ids and synthetic ids to slug filenames. */
const LEGACY_AUDIO_TO_SLUG: Record<string, string> = {
  ambient: "chill-vlog",
  pulse: "install-hype",
  focus: "epic-montage",
  down_to_business: "down-to-business",
  install_hype: "install-hype",
  chill_vlog: "chill-vlog",
  epic_montage: "epic-montage",
};

export function parseVideoCompilationOptions(
  raw: unknown,
  availableTrackIds?: string[]
): VideoCompilationOptions {
  const available = new Set(availableTrackIds ?? []);
  const defaultAudio =
    availableTrackIds && availableTrackIds.length > 0
      ? availableTrackIds[0]!
      : DEFAULT_VIDEO_COMPILATION_OPTIONS.audio;

  if (!raw || typeof raw !== "object") {
    return { style: DEFAULT_VIDEO_COMPILATION_OPTIONS.style, audio: defaultAudio };
  }
  const record = raw as Record<string, unknown>;
  const style =
    typeof record.style === "string" && STYLE_IDS.has(record.style)
      ? (record.style as VideoCompilationStyleId)
      : DEFAULT_VIDEO_COMPILATION_OPTIONS.style;

  let audioRaw = typeof record.audio === "string" ? record.audio.trim() : "";
  if (LEGACY_AUDIO_TO_SLUG[audioRaw]) {
    audioRaw = LEGACY_AUDIO_TO_SLUG[audioRaw];
  }

  if (audioRaw === "none") {
    return { style, audio: "none" };
  }

  if (audioRaw && (available.size === 0 || available.has(audioRaw))) {
    return { style, audio: audioRaw };
  }

  return { style, audio: defaultAudio };
}

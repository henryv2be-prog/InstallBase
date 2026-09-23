import { runFfmpeg } from "@/lib/video-compilation/run-ffmpeg";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import {
  absolutePathForTrack,
  resolveVideoSoundTrack,
} from "@/lib/video-compilation/sound-library.server";
import { probeMediaDurationSec } from "@/lib/video-compilation/probe";
import { FFMPEG_CRF, FFMPEG_PRESET } from "@/lib/video-compilation/constants";

/** Max length when looping photos to match a long soundtrack. */
const MAX_MUX_DURATION_SEC = 180;

export async function muxAudioOntoVideo(
  videoPath: string,
  destPath: string,
  track: VideoCompilationAudioSelection,
  videoDurationSec: number
) {
  const videoDuration = Math.max(0.5, videoDurationSec);

  if (track === "none") {
    await runFfmpeg(["-y", "-i", videoPath, "-c", "copy", "-movflags", "+faststart", destPath]);
    return;
  }

  const meta = await resolveVideoSoundTrack(track);
  if (!meta) {
    throw new Error("That sound is no longer available — pick another or use Original");
  }

  const soundtrackPath = absolutePathForTrack(meta);
  let audioDuration = videoDuration;
  try {
    audioDuration = await probeMediaDurationSec(soundtrackPath);
  } catch {
    audioDuration = videoDuration;
  }

  const finalDuration = Math.min(
    MAX_MUX_DURATION_SEC,
    Math.max(videoDuration, audioDuration)
  );
  const fadeOutStart = Math.max(0, finalDuration - 1.5);
  const mustLoopVideo = finalDuration > videoDuration + 0.15;

  const audioFilter = `[1:a]atrim=0:${finalDuration},asetpts=PTS-STARTPTS,volume=0.92,afade=t=in:st=0:d=0.25,afade=t=out:st=${fadeOutStart}:d=1.5[a]`;

  if (mustLoopVideo) {
    await runFfmpeg([
      "-y",
      "-stream_loop",
      "-1",
      "-i",
      videoPath,
      "-i",
      soundtrackPath,
      "-filter_complex",
      audioFilter,
      "-map",
      "0:v",
      "-map",
      "[a]",
      "-t",
      String(finalDuration),
      "-c:v",
      "libx264",
      "-preset",
      FFMPEG_PRESET,
      "-crf",
      FFMPEG_CRF,
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      destPath,
    ]);
    return;
  }

  await runFfmpeg([
    "-y",
    "-i",
    videoPath,
    "-i",
    soundtrackPath,
    "-filter_complex",
    audioFilter,
    "-map",
    "0:v",
    "-map",
    "[a]",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    destPath,
  ]);
}

import { runFfmpeg } from "@/lib/video-compilation/run-ffmpeg";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import {
  absolutePathForTrack,
  resolveVideoSoundTrack,
} from "@/lib/video-compilation/sound-library.server";

export async function muxAudioOntoVideo(
  videoPath: string,
  destPath: string,
  track: VideoCompilationAudioSelection,
  durationSec: number
) {
  if (track === "none") {
    await runFfmpeg(["-y", "-i", videoPath, "-c", "copy", "-movflags", "+faststart", destPath]);
    return;
  }

  const meta = await resolveVideoSoundTrack(track);
  if (!meta) {
    throw new Error("That sound is no longer available — pick another or use Original");
  }

  const soundtrackPath = absolutePathForTrack(meta);
  const duration = Math.max(0.5, durationSec);
  const fadeOutStart = Math.max(0, duration - 1.5);

  await runFfmpeg([
    "-y",
    "-i",
    videoPath,
    "-stream_loop",
    "-1",
    "-i",
    soundtrackPath,
    "-filter_complex",
    `[1:a]atrim=0:${duration},asetpts=PTS-STARTPTS,volume=0.92,afade=t=in:st=0:d=0.25,afade=t=out:st=${fadeOutStart}:d=1.5[a]`,
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

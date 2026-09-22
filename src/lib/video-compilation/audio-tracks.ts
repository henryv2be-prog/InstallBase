import path from "path";
import { runFfmpeg } from "@/lib/video-compilation/run-ffmpeg";
import type { VideoCompilationAudioId } from "@/lib/video-compilation/options";

function lavfiForTrack(track: VideoCompilationAudioId, durationSec: number): string {
  const d = Math.max(1, Math.ceil(durationSec));
  switch (track) {
    case "ambient":
      return `anoisesrc=color=pink:duration=${d}:sample_rate=44100,afade=t=in:st=0:d=1,afade=t=out:st=${Math.max(0, d - 1.5)}:d=1.5,volume=0.08`;
    case "pulse":
      return `sine=frequency=92:duration=${d},tremolo=f=1.2:d=0.35,volume=0.12,afade=t=in:st=0:d=0.8,afade=t=out:st=${Math.max(0, d - 1)}:d=1`;
    case "focus":
      return `sine=frequency=196:duration=${d},volume=0.06,afade=t=in:st=0:d=1.2,afade=t=out:st=${Math.max(0, d - 2)}:d=2`;
    default:
      return `anullsrc=r=44100:cl=stereo:d=${d}`;
  }
}

export async function muxAudioOntoVideo(
  videoPath: string,
  destPath: string,
  track: VideoCompilationAudioId,
  durationSec: number
) {
  if (track === "none") {
    await runFfmpeg(["-y", "-i", videoPath, "-c", "copy", "-movflags", "+faststart", destPath]);
    return;
  }

  const audioPath = path.join(path.dirname(videoPath), `audio-${track}.m4a`);
  await runFfmpeg([
    "-y",
    "-f",
    "lavfi",
    "-i",
    lavfiForTrack(track, durationSec),
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    audioPath,
  ]);

  await runFfmpeg([
    "-y",
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    "-movflags",
    "+faststart",
    destPath,
  ]);
}

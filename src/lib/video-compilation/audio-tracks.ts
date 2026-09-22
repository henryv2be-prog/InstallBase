import fs from "fs";
import path from "path";
import { runFfmpeg } from "@/lib/video-compilation/run-ffmpeg";
import type { VideoCompilationAudioId } from "@/lib/video-compilation/options";
import { soundtrackRelativeFile } from "@/lib/video-compilation/sound-tracks";

function resolveSoundtrackFilePath(track: VideoCompilationAudioId): string | null {
  const file = soundtrackRelativeFile(track);
  if (!file) return null;
  const filePath = path.join(process.cwd(), "public", "audio", "video-compilation", file);
  if (!fs.existsSync(filePath)) return null;
  return filePath;
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

  const soundtrackPath = resolveSoundtrackFilePath(track);
  if (!soundtrackPath) {
    throw new Error("That sound track is missing on the server — pick another or post without audio");
  }

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

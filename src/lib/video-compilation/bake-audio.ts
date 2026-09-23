import "server-only";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { getUploadDir, uploadPublicPath } from "@/lib/uploads";
import { uploadUrlToAbsolutePath } from "@/lib/video-compilation/paths";
import { probeVideoDurationSec } from "@/lib/video-compilation/probe";
import { muxAudioOntoVideo } from "@/lib/video-compilation/audio-tracks";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";

/** Mix a chosen soundtrack into an already-compiled silent install video. */
export async function bakeAudioIntoInstallVideo(
  silentVideoUrl: string,
  audio: VideoCompilationAudioSelection
): Promise<{ videoUrl: string }> {
  const absolute = uploadUrlToAbsolutePath(silentVideoUrl);
  if (!absolute) {
    throw new Error("Video file not found — try regenerating");
  }

  if (audio === "none") {
    return { videoUrl: silentVideoUrl };
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ib-video-bake-"));
  const outBasename = `install-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.mp4`;
  const outputPath = path.join(tmpDir, outBasename);

  try {
    const durationSec = await probeVideoDurationSec(absolute);
    await muxAudioOntoVideo(absolute, outputPath, audio, durationSec);

    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.copyFile(outputPath, path.join(uploadDir, outBasename));

    return { videoUrl: uploadPublicPath(outBasename) };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

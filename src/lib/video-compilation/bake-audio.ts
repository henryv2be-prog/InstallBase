import "server-only";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { getUploadDir, uploadPublicPath } from "@/lib/uploads";
import { uploadUrlToAbsolutePath } from "@/lib/video-compilation/paths";
import { probeVideoDurationSec } from "@/lib/video-compilation/probe";
import { muxAudioOntoVideo } from "@/lib/video-compilation/audio-tracks";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";

function isVideoUploadUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

/** Mix a library track onto a video URL, or return unchanged for Original / none. */
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

/** Apply optional soundtrack to each video in a post media list (photos unchanged). */
export async function bakeAudioIntoMediaUrls(
  mediaUrls: string[],
  audio: VideoCompilationAudioSelection
): Promise<string[]> {
  if (audio === "none") return mediaUrls;
  return Promise.all(
    mediaUrls.map(async (url) => {
      if (!isVideoUploadUrl(url)) return url;
      const baked = await bakeAudioIntoInstallVideo(url, audio);
      return baked.videoUrl;
    })
  );
}

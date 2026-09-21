import fs from "fs/promises";
import path from "path";
import os from "os";
import { getUploadDir, uploadPublicPath } from "@/lib/uploads";
import {
  FFMPEG_CRF,
  FFMPEG_PRESET,
  MAX_SOURCE_VIDEO_SEC,
  OUTPUT_FPS,
  OUTPUT_HEIGHT,
  OUTPUT_WIDTH,
  PHOTO_DURATION_SEC,
} from "@/lib/video-compilation/constants";
import { uploadUrlToAbsolutePath } from "@/lib/video-compilation/paths";
import { probeImageDimensions, probeVideoDurationSec } from "@/lib/video-compilation/probe";

const LANDSCAPE_PHOTO_RATIO = 1.12;
import { runFfmpeg } from "@/lib/video-compilation/run-ffmpeg";

export type SourceSegment = {
  url: string;
  type: "image" | "video";
  order: number;
};

function scaleCropFilter(zoomPan?: string) {
  const base = `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=increase,crop=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}`;
  return zoomPan ? `${base},${zoomPan}` : base;
}

function photoZoomPan(index: number) {
  const frames = Math.round(PHOTO_DURATION_SEC * OUTPUT_FPS);
  if (index % 2 === 0) {
    return `zoompan=z='min(zoom+0.0008,1.06)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}:fps=${OUTPUT_FPS}`;
  }
  return `zoompan=z='if(lte(zoom,1.0),1.06,max(1.001,zoom-0.0008))':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}:fps=${OUTPUT_FPS}`;
}

function landscapePhotoFilterComplex() {
  const w = OUTPUT_WIDTH;
  const h = OUTPUT_HEIGHT;
  return (
    `[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},gblur=sigma=24[bg];` +
    `[0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p`
  );
}

async function buildPhotoSegment(sourcePath: string, destPath: string, index: number) {
  const dimensions = await probeImageDimensions(sourcePath);
  const isLandscape =
    dimensions !== null && dimensions.width / dimensions.height > LANDSCAPE_PHOTO_RATIO;

  const commonTail = [
    "-t",
    String(PHOTO_DURATION_SEC),
    "-r",
    String(OUTPUT_FPS),
    "-c:v",
    "libx264",
    "-preset",
    FFMPEG_PRESET,
    "-crf",
    FFMPEG_CRF,
    "-pix_fmt",
    "yuv420p",
    "-an",
    destPath,
  ];

  if (isLandscape) {
    try {
      await runFfmpeg([
        "-y",
        "-loop",
        "1",
        "-i",
        sourcePath,
        "-filter_complex",
        landscapePhotoFilterComplex(),
        ...commonTail,
      ]);
      return;
    } catch {
      const pad = `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=decrease,pad=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0x0a0f18`;
      await runFfmpeg(["-y", "-loop", "1", "-i", sourcePath, "-vf", pad, ...commonTail]);
      return;
    }
  }

  const vf = scaleCropFilter(photoZoomPan(index));
  await runFfmpeg(["-y", "-loop", "1", "-i", sourcePath, "-vf", vf, ...commonTail]);
}

async function buildVideoSegment(sourcePath: string, destPath: string) {
  let duration = MAX_SOURCE_VIDEO_SEC;
  try {
    const probed = await probeVideoDurationSec(sourcePath);
    duration = Math.min(Math.max(probed, 1), MAX_SOURCE_VIDEO_SEC);
  } catch {
    duration = MAX_SOURCE_VIDEO_SEC;
  }

  const vf = scaleCropFilter();
  await runFfmpeg([
    "-y",
    "-i",
    sourcePath,
    "-vf",
    vf,
    "-t",
    String(duration),
    "-r",
    String(OUTPUT_FPS),
    "-c:v",
    "libx264",
    "-preset",
    FFMPEG_PRESET,
    "-crf",
    FFMPEG_CRF,
    "-pix_fmt",
    "yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    destPath,
  ]);
}

async function concatSegments(segmentPaths: string[], destPath: string) {
  const listPath = `${destPath}.txt`;
  const listBody = segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await fs.writeFile(listPath, listBody, "utf8");

  try {
    await runFfmpeg(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", "-an", destPath]);
  } catch {
    await runFfmpeg([
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c:v",
      "libx264",
      "-preset",
      FFMPEG_PRESET,
      "-crf",
      FFMPEG_CRF,
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      destPath,
    ]);
  } finally {
    await fs.unlink(listPath).catch(() => undefined);
  }
}

async function writePoster(videoPath: string, posterPath: string) {
  await runFfmpeg(["-y", "-i", videoPath, "-vframes", "1", "-q:v", "2", posterPath]);
}

export async function compileInstallationVideo(
  sources: SourceSegment[]
): Promise<{ videoUrl: string; posterUrl: string }> {
  const ordered = [...sources].sort((a, b) => a.order - b.order);
  if (ordered.length === 0) {
    throw new Error("Add at least two photos or videos first");
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ib-video-"));
  const segmentPaths: string[] = [];

  try {
    for (const [index, source] of ordered.entries()) {
      const absolute = uploadUrlToAbsolutePath(source.url);
      if (!absolute) {
        throw new Error("One of your files could not be found — try uploading again");
      }

      const segmentPath = path.join(tmpDir, `seg-${index}.mp4`);
      if (source.type === "image") {
        await buildPhotoSegment(absolute, segmentPath, index);
      } else {
        await buildVideoSegment(absolute, segmentPath);
      }
      segmentPaths.push(segmentPath);
    }

    const outputBasename = `install-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.mp4`;
    const posterBasename = outputBasename.replace(/\.mp4$/i, "-poster.jpg");
    const outputPath = path.join(tmpDir, outputBasename);
    const posterPath = path.join(tmpDir, posterBasename);

    await concatSegments(segmentPaths, outputPath);
    await writePoster(outputPath, posterPath);

    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.copyFile(outputPath, path.join(uploadDir, outputBasename));
    await fs.copyFile(posterPath, path.join(uploadDir, posterBasename));

    return {
      videoUrl: uploadPublicPath(outputBasename),
      posterUrl: uploadPublicPath(posterBasename),
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

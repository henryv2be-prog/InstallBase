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
} from "@/lib/video-compilation/constants";
import { uploadUrlToAbsolutePath } from "@/lib/video-compilation/paths";
import { probeImageDimensions, probeVideoDurationSec } from "@/lib/video-compilation/probe";
import {
  DEFAULT_VIDEO_COMPILATION_OPTIONS,
  parseVideoCompilationOptions,
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationOptions,
} from "@/lib/video-compilation/options";
import { muxAudioOntoVideo } from "@/lib/video-compilation/audio-tracks";
import { runFfmpeg } from "@/lib/video-compilation/run-ffmpeg";
import type { VideoTransitionKind } from "@/lib/video-compilation/style-presets";

const LANDSCAPE_PHOTO_RATIO = 1.12;

function styleColorFilter(
  style: (typeof VIDEO_COMPILATION_STYLES)[keyof typeof VIDEO_COMPILATION_STYLES]
): string | undefined {
  if ("ffmpegColorFilter" in style && typeof style.ffmpegColorFilter === "string") {
    return style.ffmpegColorFilter;
  }
  return undefined;
}

export type SourceSegment = {
  url: string;
  type: "image" | "video";
  order: number;
};

function appendColorFilter(vf: string, colorFilter?: string) {
  if (!colorFilter?.trim()) return vf;
  return `${vf},${colorFilter.trim()}`;
}

function scaleCropFilter(zoomPan?: string) {
  const base = `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=increase,crop=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}`;
  return zoomPan ? `${base},${zoomPan}` : base;
}

function photoZoomPan(index: number, photoDurationSec: number, strength: "normal" | "strong") {
  const frames = Math.round(photoDurationSec * OUTPUT_FPS);
  const step = strength === "strong" ? 0.0014 : 0.0008;
  const peak = strength === "strong" ? 1.12 : 1.06;
  if (index % 2 === 0) {
    return `zoompan=z='min(zoom+${step},${peak})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}:fps=${OUTPUT_FPS}`;
  }
  return `zoompan=z='if(lte(zoom,1.0),${peak},max(1.001,zoom-${step}))':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}:fps=${OUTPUT_FPS}`;
}

function landscapePhotoFilterComplex(colorFilter?: string) {
  const w = OUTPUT_WIDTH;
  const h = OUTPUT_HEIGHT;
  const grade = colorFilter ? `,${colorFilter}` : "";
  return (
    `[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},gblur=sigma=24[bg];` +
    `[0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p${grade}`
  );
}

async function buildPhotoSegment(
  sourcePath: string,
  destPath: string,
  index: number,
  options: VideoCompilationOptions
) {
  const style = VIDEO_COMPILATION_STYLES[options.style];
  const colorFilter = styleColorFilter(style);
  const photoDurationSec = style.photoDurationSec;
  const dimensions = await probeImageDimensions(sourcePath);
  const isLandscape =
    dimensions !== null && dimensions.width / dimensions.height > LANDSCAPE_PHOTO_RATIO;

  const commonTail = [
    "-t",
    String(photoDurationSec),
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

  const useLandscapeBlur = style.landscapeBlur && isLandscape;

  if (useLandscapeBlur) {
    try {
      await runFfmpeg([
        "-y",
        "-loop",
        "1",
        "-i",
        sourcePath,
        "-filter_complex",
        landscapePhotoFilterComplex(colorFilter),
        ...commonTail,
      ]);
      return;
    } catch {
      const pad = appendColorFilter(
        `scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=decrease,pad=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=0x0a0f18`,
        colorFilter
      );
      await runFfmpeg(["-y", "-loop", "1", "-i", sourcePath, "-vf", pad, ...commonTail]);
      return;
    }
  }

  let vf = scaleCropFilter(
    style.zoom ? photoZoomPan(index, photoDurationSec, style.zoomStrength) : undefined
  );
  vf = appendColorFilter(vf, colorFilter);
  await runFfmpeg(["-y", "-loop", "1", "-i", sourcePath, "-vf", vf, ...commonTail]);
}

async function buildVideoSegment(sourcePath: string, destPath: string, colorFilter?: string) {
  let duration = MAX_SOURCE_VIDEO_SEC;
  try {
    const probed = await probeVideoDurationSec(sourcePath);
    duration = Math.min(Math.max(probed, 1), MAX_SOURCE_VIDEO_SEC);
  } catch {
    duration = MAX_SOURCE_VIDEO_SEC;
  }

  const vf = appendColorFilter(scaleCropFilter(), colorFilter);
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

async function concatSegmentsPlain(segmentPaths: string[], destPath: string) {
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

function xfadeName(transition: VideoTransitionKind): string | null {
  switch (transition) {
    case "fade":
      return "fade";
    case "slideleft":
      return "slideleft";
    case "slideright":
      return "slideright";
    case "wipeup":
      return "wipeup";
    default:
      return null;
  }
}

async function concatSegmentsWithTransition(
  segmentPaths: string[],
  destPath: string,
  transition: VideoTransitionKind,
  transitionSec: number
) {
  const xfade = xfadeName(transition);
  if (!xfade || segmentPaths.length < 2 || transitionSec <= 0) {
    await concatSegmentsPlain(segmentPaths, destPath);
    return;
  }

  const durations = await Promise.all(segmentPaths.map((p) => probeVideoDurationSec(p)));
  const args = ["-y"];
  for (const seg of segmentPaths) {
    args.push("-i", seg);
  }

  let filter = "";
  let left = "0:v";
  let offset = durations[0]! - transitionSec;
  for (let i = 1; i < segmentPaths.length; i++) {
    const out = i === segmentPaths.length - 1 ? "vout" : `vx${i}`;
    filter += `[${left}][${i}:v]xfade=transition=${xfade}:duration=${transitionSec}:offset=${Math.max(0, offset).toFixed(3)}[${out}];`;
    left = out;
    offset += durations[i]! - transitionSec;
  }
  filter = filter.replace(/;$/, "");

  try {
    await runFfmpeg([
      ...args,
      "-filter_complex",
      filter,
      "-map",
      "[vout]",
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
  } catch {
    await concatSegmentsPlain(segmentPaths, destPath);
  }
}

async function writePoster(videoPath: string, posterPath: string) {
  await runFfmpeg(["-y", "-i", videoPath, "-vframes", "1", "-q:v", "2", posterPath]);
}

export async function compileInstallationVideo(
  sources: SourceSegment[],
  rawOptions?: unknown
): Promise<{ videoUrl: string; posterUrl: string }> {
  const options = rawOptions
    ? parseVideoCompilationOptions(rawOptions)
    : DEFAULT_VIDEO_COMPILATION_OPTIONS;
  const style = VIDEO_COMPILATION_STYLES[options.style];
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
        await buildPhotoSegment(absolute, segmentPath, index, options);
      } else {
        await buildVideoSegment(absolute, segmentPath, styleColorFilter(style));
      }
      segmentPaths.push(segmentPath);
    }

    const outputBasename = `install-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.mp4`;
    const posterBasename = outputBasename.replace(/\.mp4$/i, "-poster.jpg");
    const silentPath = path.join(tmpDir, `silent-${outputBasename}`);
    const outputPath = path.join(tmpDir, outputBasename);
    const posterPath = path.join(tmpDir, posterBasename);

    await concatSegmentsWithTransition(
      segmentPaths,
      silentPath,
      style.transition,
      style.transitionSec
    );
    const durationSec = await probeVideoDurationSec(silentPath);
    await muxAudioOntoVideo(silentPath, outputPath, options.audio, durationSec);
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

import fs from "fs";
import { execSync } from "child_process";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

function isExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}

function commandOnPath(name: string): string | null {
  try {
    const resolved = execSync(`command -v ${name}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return resolved && isExecutable(resolved) ? resolved : null;
  } catch {
    return null;
  }
}

function resolveBinary(
  tool: "ffmpeg" | "ffprobe",
  envVar: "FFMPEG_PATH" | "FFPROBE_PATH",
  staticPath: string | null | undefined,
  commonPaths: string[]
): string {
  const fromEnv = process.env[envVar]?.trim();
  if (fromEnv && isExecutable(fromEnv)) return fromEnv;

  const onPath = commandOnPath(tool);
  if (onPath) return onPath;

  for (const candidate of commonPaths) {
    if (isExecutable(candidate)) return candidate;
  }

  if (staticPath && isExecutable(staticPath)) return staticPath;

  throw new Error(`${tool} is not available on this server`);
}

export function resolveFfmpegBinary(): string {
  return resolveBinary("ffmpeg", "FFMPEG_PATH", ffmpegStatic, [
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
  ]);
}

export function resolveFfprobeBinary(): string {
  return resolveBinary("ffprobe", "FFPROBE_PATH", ffprobeStatic.path, [
    "/usr/bin/ffprobe",
    "/usr/local/bin/ffprobe",
  ]);
}

/** Logged once at startup so Railway deploy logs show whether video compile can run. */
export function logFfmpegAvailability() {
  try {
    const ffmpeg = resolveFfmpegBinary();
    console.info(`[install-video] ffmpeg: ${ffmpeg}`);
  } catch {
    console.error(
      "[install-video] ffmpeg not found — set FFMPEG_PATH or install ffmpeg (nixpacks aptPkgs / nixPkgs)"
    );
  }
}

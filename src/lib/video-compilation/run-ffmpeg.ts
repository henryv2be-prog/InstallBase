import { spawn } from "child_process";
import { resolveFfmpegBinary } from "@/lib/video-compilation/ffmpeg-path";

export function ffmpegBinary(): string {
  return resolveFfmpegBinary();
}

export function runFfmpeg(args: string[], timeoutMs = 600_000): Promise<void> {
  return new Promise((resolve, reject) => {
    let bin: string;
    try {
      bin = ffmpegBinary();
    } catch {
      reject(new Error("Video tools are not ready — try again later or post as photos"));
      return;
    }

    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Video preparation took too long — try fewer or shorter clips"));
    }, timeoutMs);

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 32_000) stderr = stderr.slice(-32_000);
    });

    child.on("error", () => {
      clearTimeout(timer);
      reject(new Error("Video tools are not ready — try again later or post as photos"));
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error("Could not assemble your install video — try again"));
    });
  });
}

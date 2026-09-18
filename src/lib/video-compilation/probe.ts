import { spawn } from "child_process";
import { resolveFfprobeBinary } from "@/lib/video-compilation/ffmpeg-path";

export async function probeVideoDurationSec(filePath: string): Promise<number> {
  let bin: string;
  try {
    bin = resolveFfprobeBinary();
  } catch {
    throw new Error("Could not read video length");
  }

  return new Promise((resolve, reject) => {
    const child = spawn(
      bin,
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        filePath,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    let stdout = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.on("error", () => {
      reject(new Error("Could not read video length"));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error("Could not read video length"));
        return;
      }
      const value = Number.parseFloat(stdout.trim());
      if (!Number.isFinite(value) || value <= 0) {
        reject(new Error("Could not read video length"));
        return;
      }
      resolve(value);
    });
  });
}

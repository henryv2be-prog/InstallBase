import { spawn } from "child_process";
import { resolveFfprobeBinary } from "@/lib/video-compilation/ffmpeg-path";

export async function probeImageDimensions(
  filePath: string
): Promise<{ width: number; height: number } | null> {
  let bin: string;
  try {
    bin = resolveFfprobeBinary();
  } catch {
    return null;
  }

  return new Promise((resolve) => {
    const child = spawn(
      bin,
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=s=x:p=0",
        filePath,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    let stdout = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.on("error", () => resolve(null));

    child.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      const [widthRaw, heightRaw] = stdout.trim().split("x");
      const width = Number.parseInt(widthRaw ?? "", 10);
      const height = Number.parseInt(heightRaw ?? "", 10);
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        resolve(null);
        return;
      }
      resolve({ width, height });
    });
  });
}

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

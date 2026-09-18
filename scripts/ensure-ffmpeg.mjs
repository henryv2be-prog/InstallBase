import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function ok(cmd) {
  const result = spawnSync(cmd, ["-version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return result.status === 0;
}

if (ok("ffmpeg")) {
  console.log("→ ffmpeg on PATH");
  process.exit(0);
}

try {
  const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  if (ffmpegPath && ok(ffmpegPath)) {
    console.log(`→ ffmpeg via @ffmpeg-installer/ffmpeg (${ffmpegPath})`);
    process.exit(0);
  }
} catch (error) {
  console.warn("→ @ffmpeg-installer/ffmpeg:", error instanceof Error ? error.message : error);
}

try {
  const staticPath = require("ffmpeg-static");
  if (staticPath && ok(staticPath)) {
    console.log(`→ ffmpeg via ffmpeg-static (${staticPath})`);
    process.exit(0);
  }
} catch {
  // continue
}

console.warn("⚠ No working ffmpeg at build time — install video may fail until deploy includes ffmpeg");
process.exit(0);

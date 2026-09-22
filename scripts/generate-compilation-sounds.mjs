#!/usr/bin/env node
/**
 * Generates short loopable MP3 beds for create-video (royalty-free, synthesized in-repo).
 * Re-run after changing recipes: node scripts/generate-compilation-sounds.mjs
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "audio", "video-compilation");

const TRACKS = [
  {
    file: "down-to-business.mp3",
    duration: 32,
    filter:
      "amix=inputs=4:duration=longest:dropout_transition=0," +
      "volume=1.8," +
      "highpass=f=80,lowpass=f=12000," +
      "afade=t=in:st=0:d=0.05,afade=t=out:st=31.5:d=0.5",
    inputs: [
      "aevalsrc='0.55*sin(2*PI*82*t)*if(lte(mod(t,0.46875),0.08),1,0)*exp(-18*mod(t,0.46875))':s=44100:d=32",
      "aevalsrc='0.35*sin(2*PI*180*t)*if(between(mod(t,0.9375),0.46875,0.55),1,0)*exp(-25*(mod(t,0.9375)-0.46875))':s=44100:d=32",
      "aevalsrc='0.12*sin(2*PI*8000*t)*if(lte(mod(t,0.1171875),0.015),1,0)*exp(-40*mod(t,0.1171875))':s=44100:d=32",
      "aevalsrc='0.22*sin(2*PI*110*t)*if(eq(mod(floor(t*2),2),0),1,0.6)*sin(2*PI*0.25*t)':s=44100:d=32",
    ],
  },
  {
    file: "install-hype.mp3",
    duration: 28,
    filter:
      "amix=inputs=3:duration=longest:dropout_transition=0,volume=1.6,highpass=f=100,afade=t=in:st=0:d=0.05,afade=t=out:st=27.5:d=0.5",
    inputs: [
      "aevalsrc='0.5*sin(2*PI*75*t)*if(lte(mod(t,0.375),0.06),1,0)*exp(-22*mod(t,0.375))':s=44100:d=28",
      "aevalsrc='0.25*sin(2*PI*220*t)*if(between(mod(t,0.75),0.375,0.42),1,0)':s=44100:d=28",
      "aevalsrc='0.18*sin(2*PI*55*t+2*sin(2*PI*2*t))*if(gt(sin(2*PI*0.5*t),-0.2),1,0.4)':s=44100:d=28",
    ],
  },
  {
    file: "chill-vlog.mp3",
    duration: 30,
    filter:
      "amix=inputs=2:duration=longest:dropout_transition=0,volume=1.2,lowpass=f=8000,afade=t=in:st=0:d=0.8,afade=t=out:st=29:d=1",
    inputs: [
      "aevalsrc='0.15*sin(2*PI*196*t)*sin(2*PI*0.125*t)+0.08*sin(2*PI*247*t)*sin(2*PI*0.125*t+1)':s=44100:d=30",
      "aevalsrc='0.06*sin(2*PI*330*t)*if(lte(mod(t,2),0.02),1,0.3)':s=44100:d=30",
    ],
  },
  {
    file: "epic-montage.mp3",
    duration: 34,
    filter:
      "amix=inputs=3:duration=longest:dropout_transition=0,volume=1.5,lowpass=f=14000,afade=t=in:st=0:d=1.2,afade=t=out:st=32.5:d=1.5",
    inputs: [
      "aevalsrc='0.2*sin(2*PI*65*t)*(0.5+0.5*sin(2*PI*0.08*t))':s=44100:d=34",
      "aevalsrc='0.12*sin(2*PI*130*t)*(0.5+0.5*sin(2*PI*0.08*t+1))':s=44100:d=34",
      "aevalsrc='0.08*sin(2*PI*392*t)*if(gt(t,8),1,0)*if(lt(t,30),1,0)':s=44100:d=34",
    ],
  },
];

function ffmpeg(args) {
  const result = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr?.slice(-2000));
    throw new Error(`ffmpeg failed: ${args.join(" ")}`);
  }
}

fs.mkdirSync(outDir, { recursive: true });

for (const track of TRACKS) {
  const dest = path.join(outDir, track.file);
  const args = ["-y"];
  for (const input of track.inputs) {
    args.push("-f", "lavfi", "-i", input);
  }
  args.push("-filter_complex", track.filter, "-t", String(track.duration), "-c:a", "libmp3lame", "-b:a", "192k", dest);
  console.log("→", track.file);
  ffmpeg(args);
}

console.log("Done. Files in public/audio/video-compilation/");

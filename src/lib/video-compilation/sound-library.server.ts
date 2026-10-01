import "server-only";
import fs from "fs/promises";
import path from "path";

export const VIDEO_SOUND_PUBLIC_BASE = "/audio/video-compilation";

const LIBRARY_ROOT = path.join(process.cwd(), "public", "audio", "video-compilation");
const MANIFEST_NAME = "manifest.json";

export type VideoSoundTrack = {
  /** Stable id — mp3 filename without extension (e.g. `down-to-business`). */
  id: string;
  file: string;
  label: string;
  tag: string;
  description: string;
  /** Path segment under VIDEO_SOUND_PUBLIC_BASE for preview URLs. */
  publicPath: string;
};

type ManifestFile = {
  tracks?: Record<
    string,
    {
      label?: string;
      tag?: string;
      description?: string;
      file?: string;
    }
  >;
};

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function tagFromSlug(slug: string): string {
  const title = titleFromSlug(slug);
  return title.length > 12 ? `${title.slice(0, 11)}…` : title;
}

async function readManifest(): Promise<ManifestFile> {
  try {
    const raw = await fs.readFile(path.join(LIBRARY_ROOT, MANIFEST_NAME), "utf8");
    return JSON.parse(raw) as ManifestFile;
  } catch {
    return {};
  }
}

async function walkForMp3(dir: string, relativePrefix: string): Promise<{ relativePath: string }[]> {
  const found: { relativePath: string }[] = [];
  let entries: { name: string; isDirectory(): boolean }[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const rel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      found.push(...(await walkForMp3(full, rel)));
      continue;
    }
    if (/\.mp3$/i.test(entry.name)) {
      found.push({ relativePath: rel.replace(/\\/g, "/") });
    }
  }
  return found;
}

/** All loopable tracks shipped in public/audio/video-compilation (any subfolder). */
export async function listVideoSoundTracks(): Promise<VideoSoundTrack[]> {
  const manifest = await readManifest();
  const files = await walkForMp3(LIBRARY_ROOT, "");
  const tracks: VideoSoundTrack[] = [];

  for (const { relativePath } of files) {
    const fileName = path.basename(relativePath);
    const id = fileName.replace(/\.mp3$/i, "");
    const override = manifest.tracks?.[id] ?? manifest.tracks?.[relativePath];
    const file = override?.file?.trim() || relativePath;
    const label = override?.label?.trim() || titleFromSlug(id);
    const tag = override?.tag?.trim() || tagFromSlug(id);
    const description =
      override?.description?.trim() ||
      "Royalty-free loop — add labels in manifest.json if you like";

    tracks.push({
      id,
      file,
      label,
      tag,
      description,
      publicPath: `${VIDEO_SOUND_PUBLIC_BASE}/${file.split("/").map(encodeURIComponent).join("/")}`,
    });
  }

  tracks.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  return tracks;
}

export async function resolveVideoSoundTrack(
  audioId: string
): Promise<VideoSoundTrack | null> {
  if (!audioId || audioId === "none") return null;
  const tracks = await listVideoSoundTracks();
  const normalized = audioId.trim();
  return (
    tracks.find((t) => t.id === normalized) ??
    tracks.find((t) => t.file.replace(/\.mp3$/i, "") === normalized) ??
    null
  );
}

export function absolutePathForTrack(track: VideoSoundTrack): string {
  return path.join(LIBRARY_ROOT, track.file);
}

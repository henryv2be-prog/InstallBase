import { NextResponse } from "next/server";
import { listVideoSoundTracks } from "@/lib/video-compilation/sound-library.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const tracks = await listVideoSoundTracks();
  return NextResponse.json({
    tracks: tracks.map(({ id, label, tag, description, publicPath }) => ({
      id,
      label,
      tag,
      description,
      publicPath,
    })),
  });
}

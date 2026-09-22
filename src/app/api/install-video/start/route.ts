import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { shouldAutoCompileInstallVideo } from "@/lib/video-compilation/eligibility";
import {
  upsertInstallVideoDraft,
  type InstallVideoDraftInput,
  type InstallVideoMediaInput,
} from "@/lib/video-compilation/draft-post";
import { parseVideoCompilationOptions } from "@/lib/video-compilation/options";
import { listVideoSoundTracks } from "@/lib/video-compilation/sound-library.server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  postId?: string;
  media: InstallVideoMediaInput[];
  draft: InstallVideoDraftInput;
  compilationOptions?: unknown;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to create a post" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Body;
    const media = (body.media ?? []).filter((item) => item.url?.trim());
    if (media.length < 2) {
      return NextResponse.json(
        { error: "Add at least two photos or videos to create an install video" },
        { status: 400 }
      );
    }

    const kinds = media.map((item) => ({
      kind: item.type,
      status: "ready" as const,
    }));
    if (!shouldAutoCompileInstallVideo(kinds)) {
      return NextResponse.json(
        { error: "Add more install photos or mix photos and video clips" },
        { status: 400 }
      );
    }

    const library = await listVideoSoundTracks();
    const compilationOptions = parseVideoCompilationOptions(
      body.compilationOptions,
      library.map((t) => t.id)
    );
    const { postId } = await upsertInstallVideoDraft(
      session.user.id,
      media,
      body.draft ?? { content: "", postIntent: "GENERAL", showExactLocation: false },
      body.postId,
      compilationOptions
    );

    return NextResponse.json({ postId, status: "QUEUED" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start video generation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

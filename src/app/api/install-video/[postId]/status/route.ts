import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { postId } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      videoCompilationStatus: true,
      generatedVideoUrl: true,
      generatedVideoPosterUrl: true,
      videoCompilationError: true,
      media: {
        where: { mediaRole: "SOURCE" },
        orderBy: { order: "asc" },
        select: { id: true, url: true, type: true, order: true },
      },
    },
  });

  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: post.videoCompilationStatus,
    generatedVideoUrl: post.generatedVideoUrl,
    generatedVideoPosterUrl: post.generatedVideoPosterUrl,
    error: post.videoCompilationError,
    sourceMedia: post.media,
  });
}

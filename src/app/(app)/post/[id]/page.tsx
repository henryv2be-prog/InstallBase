import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPost } from "@/lib/queries";
import { markNotificationsReadForUser } from "@/lib/notification-read";
import { PostCard } from "@/components/feed/post-card";
import { QuestionAnswers } from "@/components/feed/question-answers";
import { CommentSection } from "@/components/feed/comment-section";
import { BackLink } from "@/components/ui/back-link";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post?.title ?? "Post" };
}

export default async function PostDetailPage({ params, searchParams }: PostPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const session = await auth();
  const post = await getPost(id, session?.user?.id);
  if (!post) notFound();

  if (session?.user?.id) {
    await markNotificationsReadForUser(session.user.id, { link: `/post/${id}` });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      {from === "activity" && <BackLink href="/activity" label="Back to Activity" />}
      <PostCard post={post} currentUserId={session?.user?.id} showFull />
      {post.type === "QUESTION" ? (
        <QuestionAnswers
          post={post}
          currentUserId={session?.user?.id}
          isAuthor={post.authorId === session?.user?.id}
        />
      ) : (
        <CommentSection
          postId={post.id}
          comments={post.comments}
          currentUserId={session?.user?.id}
        />
      )}
    </div>
  );
}

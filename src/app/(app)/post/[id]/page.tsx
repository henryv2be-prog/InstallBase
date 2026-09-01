import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPost } from "@/lib/queries";
import { PostCard } from "@/components/feed/post-card";
import { QuestionAnswers } from "@/components/feed/question-answers";
import { CommentSection } from "@/components/feed/comment-section";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post?.title ?? "Post" };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const [post, session] = await Promise.all([getPost(id), auth()]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
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

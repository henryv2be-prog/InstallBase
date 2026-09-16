import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPost } from "@/lib/queries";
import { deferMarkNotificationsReadForUser } from "@/lib/notification-read";
import { PostCard } from "@/components/feed/post-card";
import { PostWorkSettings } from "@/components/feed/post-work-settings";
import { QuestionAnswers } from "@/components/feed/question-answers";
import { CommentSection } from "@/components/feed/comment-section";
import { BackLink } from "@/components/ui/back-link";
import { ReengagementOpenTracker } from "@/components/reengagement/open-tracker";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; ref?: string; nid?: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);
  return { title: post?.title ?? "Post" };
}

export default async function PostDetailPage({ params, searchParams }: PostPageProps) {
  const { id } = await params;
  const { from, ref, nid } = await searchParams;
  const session = await getSession();
  const post = await getPost(id, session?.user?.id);
  if (!post) notFound();

  if (session?.user?.id) {
    deferMarkNotificationsReadForUser(session.user.id, { link: `/post/${id}` });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      <ReengagementOpenTracker refParam={ref} notificationId={nid} />
      {from === "activity" && <BackLink href="/activity" label="Back to Activity" />}
      <PostCard post={post} currentUserId={session?.user?.id} showFull />
      {post.authorId === session?.user?.id && (
        <PostWorkSettings
          postId={post.id}
          type={post.type}
          postIntent={post.postIntent}
          inPortfolio={post.inPortfolio}
          showExactLocation={post.showExactLocation}
          workDate={post.workDate}
          workDetails={post.workDetails}
          location={post.location}
          categories={post.categories}
        />
      )}
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

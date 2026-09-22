import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPost } from "@/lib/queries";
import { CreatePostCard } from "@/components/feed/create-post";
import { CreateFlowViewport } from "@/components/layout/create-flow-viewport";

export const metadata = { title: "Edit Post" };

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?next=/post/${id}/edit`);

  const post = await getPost(id, session.user.id);
  if (!post) notFound();
  if (post.authorId !== session.user.id) redirect(`/post/${id}`);

  return (
    <CreateFlowViewport title="Edit Post" className="mx-auto max-w-2xl animate-fade-in">
      <CreatePostCard
        fitViewport
        userName={session.user.name}
        editPost={{
          id: post.id,
          type: post.type,
          content: post.content,
          title: post.title,
          postIntent: post.postIntent,
          location: post.location,
          showExactLocation: post.showExactLocation,
          workDate: post.workDate,
          workDetails: post.workDetails,
          categories: post.categories,
          media: post.media.map((item) => ({ url: item.url, type: item.type })),
        }}
      />
    </CreateFlowViewport>
  );
}

import { auth } from "@/lib/auth";
import { getFeedPosts } from "@/lib/queries";
import { CreatePostCard } from "@/components/feed/create-post";
import { PostFeed } from "@/components/feed/post-card";

export const metadata = { title: "Feed" };

export default async function FeedPage() {
  const session = await auth();
  const posts = await getFeedPosts(session?.user?.id);

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      <CreatePostCard
        userName={session?.user?.name}
        userImage={session?.user?.image}
        compact
      />
      <PostFeed posts={posts} currentUserId={session?.user?.id} />
    </div>
  );
}

import { auth } from "@/lib/auth";
import { getFeedPosts, getFollowingFeedPosts } from "@/lib/queries";
import { CreatePostCard } from "@/components/feed/create-post";
import { PostFeed } from "@/components/feed/post-card";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Feed" };

interface FeedPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await auth();
  const { tab } = await searchParams;
  const followingTab = tab === "following";
  const userId = session?.user?.id;

  const posts = followingTab && userId
    ? await getFollowingFeedPosts(userId)
    : await getFeedPosts(userId);

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-fade-in">
      <CreatePostCard
        userName={session?.user?.name}
        userImage={session?.user?.image}
        compact
      />

      <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <Link
          href="/feed"
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
            !followingTab
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-500"
          )}
        >
          For you
        </Link>
        <Link
          href="/feed?tab=following"
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-semibold",
            followingTab
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-500"
          )}
        >
          Following
        </Link>
      </div>

      {followingTab && posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="text-lg font-semibold">No posts from people you follow</p>
          <p className="mt-2 text-gray-500">
            Follow installers to see their work here. Discover people on{" "}
            <Link href="/discover" className="font-semibold text-blue-600 hover:underline">
              Discover
            </Link>
            .
          </p>
        </div>
      ) : (
        <PostFeed posts={posts} currentUserId={userId} />
      )}
    </div>
  );
}

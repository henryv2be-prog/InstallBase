import { auth } from "@/lib/auth";
import { getPostsByType, getBragOfWeek } from "@/lib/queries";
import { PostFeed } from "@/components/feed/post-card";
import { PostCard } from "@/components/feed/post-card";
import { BRAG_CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Brags" };

export default async function BragsPage() {
  const session = await auth();
  const [brags, bragOfWeek] = await Promise.all([
    getPostsByType("BRAG", 20),
    getBragOfWeek(),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">🏆 Brags</h1>
        <p className="text-gray-500">The best installations from the community</p>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">🏆 Brag of the Week</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bragOfWeek.slice(0, 8).map(({ category, post }, i) => (
            post && (
              <div
                key={category}
                className="overflow-hidden rounded-2xl border border-orange-200 bg-white dark:border-orange-900/50 dark:bg-gray-900"
              >
                <div className="bg-orange-500 px-4 py-2 text-sm font-bold text-white">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆"} {category}
                </div>
                <div className="p-4">
                  <Link href={`/profile/${post.author.profile?.username}`} className="text-sm font-semibold hover:text-blue-600">
                    {post.author.name}
                  </Link>
                  <p className="mt-1 font-medium line-clamp-2">{post.title ?? post.content.slice(0, 80)}</p>
                  <p className="mt-2 text-sm font-bold text-orange-600">🏆 {post.bragScore} points</p>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">All Brags</h2>
        <div className="mx-auto max-w-2xl">
          <PostFeed posts={brags} currentUserId={session?.user?.id} />
        </div>
      </section>
    </div>
  );
}

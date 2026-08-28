import { auth } from "@/lib/auth";
import { getAllTimeBrags, getBragOfWeek, getHotBrags } from "@/lib/queries";
import { PostFeed } from "@/components/feed/post-card";
import Link from "next/link";

export const metadata = { title: "Brags" };

export default async function BragsPage() {
  const session = await auth();
  const [hotBrags, bragOfWeek, allTime] = await Promise.all([
    getHotBrags(20),
    getBragOfWeek(),
    getAllTimeBrags(4),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">🏆 Brags</h1>
        <p className="text-gray-500">
          The best installations from the community. Brags stay on your profile — this page shows what&apos;s hot right now.
        </p>
      </div>

      <section>
        <h2 className="mb-1 text-xl font-bold">🏆 Brag of the Week</h2>
        <p className="mb-4 text-sm text-muted">Resets every Sunday. Give brag points to lift this week&apos;s installs.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bragOfWeek.slice(0, 8).map(({ category, post }, i) => (
            post && (
              <div
                key={post.id}
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

      {allTime.length > 0 && (
        <section>
          <h2 className="mb-1 text-xl font-bold">All-time</h2>
          <p className="mb-4 text-sm text-muted">Highest brag points ever. These never expire.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allTime.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="rounded-2xl border border-border bg-card p-4 hover:border-orange-400/50"
              >
                <p className="text-sm font-semibold">{post.author.name}</p>
                <p className="mt-1 line-clamp-2 font-medium">{post.title ?? post.content.slice(0, 80)}</p>
                <p className="mt-2 text-sm font-bold text-orange-600">🏆 {post.bragScore} points</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-xl font-bold">Hot right now</h2>
        <p className="mb-4 text-sm text-muted">Recent installs ranked by brag points. Older posts fade from this list, not from profiles.</p>
        <div className="mx-auto max-w-2xl">
          <PostFeed posts={hotBrags} currentUserId={session?.user?.id} />
        </div>
      </section>
    </div>
  );
}

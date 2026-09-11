import Link from "next/link";
import { searchAll, getFollowingIds } from "@/lib/queries";
import { PostCard } from "@/components/feed/post-card";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { auth } from "@/lib/auth";
import { FollowButton } from "@/components/profile/follow-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";

export async function SearchResults({ query, filter = "all" }: { query: string; filter?: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  const [results, followingIds] = await Promise.all([
    searchAll(query, userId),
    userId ? getFollowingIds(userId) : Promise.resolve([] as string[]),
  ]);
  const followingSet = new Set(followingIds);

  const showUsers = filter === "all" || filter === "installers";
  const showPosts = filter === "all" || filter === "posts";
  const showProducts = filter === "all" || filter === "products";
  const showProjects = filter === "all" || filter === "projects";

  const total =
    (showUsers ? results.users.length : 0) +
    (showPosts ? results.posts.length : 0) +
    (showProducts ? results.products.length : 0) +
    (showProjects ? results.projects.length : 0);

  if (total === 0) {
    return (
      <EmptyState
        icon={Search}
        title={`No results for "${query}"`}
        description="Try Hikvision, ANPR, PoE, Ubiquiti, or a city name."
      />
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <p className="text-sm text-muted">
        Found {total} result{total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
      </p>

      <AdSlot placement={AD_PLACEMENTS.SEARCH_RESULTS} />

      {showUsers && results.users.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Installers ({results.users.length})</h2>
          <div className="space-y-2">
            {results.users.map((user) => (
              <div
                key={user.id}
                className="glass-card flex items-center gap-3 rounded-xl p-3"
              >
                <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <PresenceAvatar
                    src={user.user.image}
                    name={user.user.name}
                    lastSeenAt={user.user.lastSeenAt}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.user.name}</p>
                    <p className="truncate text-sm text-muted">@{user.username}</p>
                  </div>
                </Link>
                {session?.user?.id !== user.userId && (
                  <FollowButton
                    userId={user.userId}
                    currentUserId={session?.user?.id}
                    initialFollowing={followingSet.has(user.userId)}
                    targetName={user.user.name ?? undefined}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {showPosts && results.posts.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Posts ({results.posts.length})</h2>
          <div className="space-y-4">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
            ))}
          </div>
        </section>
      )}

      {showProducts && results.products.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Products ({results.products.length})</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {results.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="glass-card rounded-xl p-4 hover:shadow-sm"
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted">{product.brand?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showProjects && results.projects.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Projects ({results.projects.length})</h2>
          <div className="space-y-2">
            {results.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-semibold">{project.title}</p>
                <p className="text-sm text-muted line-clamp-1">{project.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

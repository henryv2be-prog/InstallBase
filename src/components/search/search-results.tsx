import Link from "next/link";
import { searchAll } from "@/lib/queries";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function SearchResults({ query }: { query: string }) {
  const [results, session] = await Promise.all([searchAll(query), auth()]);

  const total =
    results.users.length +
    results.posts.length +
    results.products.length +
    results.projects.length;

  if (total === 0) {
    return (
      <p className="mt-6 text-gray-500">
        No results for &ldquo;{query}&rdquo;. Try Hikvision, ANPR, PoE, or a city name.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {results.users.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Installers</h2>
          <div className="space-y-2">
            {results.users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <Avatar>
                  <AvatarImage src={user.user.image ?? undefined} />
                  <AvatarFallback>{getInitials(user.user.name ?? "U")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.posts.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Posts</h2>
          <div className="space-y-4">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
            ))}
          </div>
        </section>
      )}

      {results.products.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Products</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {results.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">{product.brand?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.projects.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">Projects</h2>
          <div className="space-y-2">
            {results.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-semibold">{project.title}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

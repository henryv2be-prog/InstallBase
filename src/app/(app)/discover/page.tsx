import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import {
  getDiscoverData,
  getFollowingIds,
  getPostsByType,
  getProjects,
  getHotBrags,
  getAllTimeBrags,
  getBragOfWeek,
} from "@/lib/queries";
import { FollowButton } from "@/components/profile/follow-button";
import { PostCard, PostFeed } from "@/components/feed/post-card";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { DiscoverTabs } from "@/components/discover/discover-tabs";

export const metadata = { title: "Explore" };

interface DiscoverPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const session = await auth();
  const { tab = "trending" } = await searchParams;
  const userId = session?.user?.id;

  const [{ trendingBrags, trendingQuestions, topInstallers, bragLeaderboard, products }, followingIds] =
    await Promise.all([
      getDiscoverData(userId),
      userId ? getFollowingIds(userId) : Promise.resolve([] as string[]),
    ]);
  const followingSet = new Set(followingIds);

  const [questions, projects, hotBrags, bragOfWeek, allTime] = await Promise.all([
    tab === "questions" ? getPostsByType("QUESTION", 30, userId) : Promise.resolve([]),
    tab === "projects" ? getProjects() : Promise.resolve([]),
    tab === "leaderboard" ? getHotBrags(20, userId) : Promise.resolve([]),
    tab === "leaderboard" ? getBragOfWeek(userId) : Promise.resolve([]),
    tab === "leaderboard" ? getAllTimeBrags(4, userId) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-gray-500">Trending installations, installers, and products</p>
      </div>

      <Suspense fallback={null}>
        <DiscoverTabs />
      </Suspense>

      {(tab === "trending" || !tab) && (
        <>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Trending Installations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trendingBrags.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={userId} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold">Popular Questions</h2>
            <div className="mx-auto max-w-2xl">
              <PostFeed posts={trendingQuestions.slice(0, 4)} currentUserId={userId} />
            </div>
            <Link href="/discover?tab=questions" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
              View all questions →
            </Link>
          </section>
        </>
      )}

      {tab === "questions" && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Questions</h2>
          <div className="mx-auto max-w-2xl">
            <PostFeed posts={questions} currentUserId={userId} />
          </div>
        </section>
      )}

      {tab === "projects" && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  {project.media[0] && (
                    <Image
                      src={project.media[0].url}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="400px"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold group-hover:text-blue-600">{project.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(tab === "trending" || tab === "people") && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Trending Installers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topInstallers.map((installer) => (
              <div
                key={installer.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <Link href={`/profile/${installer.username}`} className="flex items-center gap-3">
                  <PresenceAvatar
                    src={installer.user.image}
                    name={installer.user.name}
                    lastSeenAt={installer.user.lastSeenAt}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{installer.user.name}</p>
                    <p className="text-sm text-gray-500">@{installer.username}</p>
                  </div>
                </Link>
                <p className="mt-2 text-sm text-blue-600">⭐ {formatNumber(installer.reputationScore)}</p>
                {userId !== installer.userId && (
                  <div className="mt-3">
                    <FollowButton
                      userId={installer.userId}
                      currentUserId={userId}
                      initialFollowing={followingSet.has(installer.userId)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {(tab === "trending" || tab === "products") && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Popular Products</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">{product.brand?.name}</p>
                <Badge variant="secondary" className="mt-2">{product._count.postProducts} posts</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(tab === "trending" || tab === "leaderboard") && (
        <section>
          <h2 className="mb-4 text-xl font-bold">🏆 Brag Leaderboard</h2>
          {tab === "leaderboard" && (
            <>
              <p className="mb-4 text-sm text-muted">Resets every Sunday. Give brag points to lift this week&apos;s installs.</p>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {bragOfWeek.slice(0, 8).map(({ category, post }, i) =>
                  post ? (
                    <div key={post.id} className="overflow-hidden rounded-2xl border border-orange-200 bg-white dark:border-orange-900/50 dark:bg-gray-900">
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
                  ) : null
                )}
              </div>
              {allTime.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 text-lg font-bold">All-time</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {allTime.map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`} className="rounded-2xl border border-border bg-card p-4 hover:border-orange-400/50">
                        <p className="text-sm font-semibold">{post.author.name}</p>
                        <p className="mt-1 line-clamp-2 font-medium">{post.title ?? post.content.slice(0, 80)}</p>
                        <p className="mt-2 text-sm font-bold text-orange-600">🏆 {post.bragScore} points</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <h3 className="mb-3 text-lg font-bold">Hot right now</h3>
              <div className="mx-auto max-w-2xl">
                <PostFeed posts={hotBrags} currentUserId={userId} />
              </div>
            </>
          )}
          {tab === "trending" && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              {bragLeaderboard.map((installer, i) => (
                <Link
                  key={installer.id}
                  href={`/profile/${installer.username}`}
                  className="flex items-center gap-4 border-b border-gray-100 p-4 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <span className="w-8 text-lg font-bold text-gray-400">#{i + 1}</span>
                  <PresenceAvatar src={installer.user.image} name={installer.user.name} lastSeenAt={installer.user.lastSeenAt} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="font-semibold">{installer.user.name}</p>
                    <p className="text-sm text-gray-500">🏆 {installer.bragCount} brags</p>
                  </div>
                  <span className="font-bold text-orange-600">⭐ {installer.reputationScore}</span>
                </Link>
              ))}
            </div>
          )}
          {tab === "trending" && (
            <Link href="/discover?tab=leaderboard" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
              View full leaderboard →
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

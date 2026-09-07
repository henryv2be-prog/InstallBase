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
import { TrendingUp, HelpCircle, FolderKanban } from "lucide-react";
import { DiscoverTabs } from "@/components/discover/discover-tabs";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Explore" };
export const dynamic = "force-dynamic";

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
        <p className="text-muted">Trending installations, installers, and products</p>
      </div>

      <Suspense fallback={null}>
        <DiscoverTabs />
      </Suspense>

      {(tab === "trending" || !tab) && (
        <>
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <TrendingUp className="h-5 w-5 text-primary" />
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
            <Link href="/discover?tab=questions" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              View all questions →
            </Link>
          </section>
        </>
      )}

      {tab === "questions" && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Questions</h2>
          <div className="mx-auto max-w-2xl">
            {questions.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="No questions yet"
                description="Be the first to ask the community for help."
                action={{ label: "Ask a question", href: "/create" }}
              />
            ) : (
              <PostFeed posts={questions} currentUserId={userId} />
            )}
          </div>
        </section>
      )}

      {tab === "projects" && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Projects</h2>
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Full job write-ups with equipment lists and photos."
            />
          ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group glass-card overflow-hidden rounded-2xl transition-shadow hover:shadow-lg"
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
                  <h3 className="font-bold group-hover:text-primary">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted line-clamp-2">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
          )}
        </section>
      )}

      {(tab === "trending" || tab === "people") && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Trending Installers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topInstallers.map((installer) => (
              <div
                key={installer.id}
                className="glass-card rounded-2xl p-4"
              >
                <Link href={`/profile/${installer.username}`} className="flex items-center gap-3">
                  <PresenceAvatar
                    src={installer.user.image}
                    name={installer.user.name}
                    lastSeenAt={installer.user.lastSeenAt}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{installer.user.name}</p>
                    <p className="text-sm text-muted">@{installer.username}</p>
                  </div>
                </Link>
                <p className="mt-2 text-sm text-primary">⭐ {formatNumber(installer.reputationScore)}</p>
                {userId !== installer.userId && (
                  <div className="mt-3">
                  <FollowButton
                    userId={installer.userId}
                    currentUserId={userId}
                    initialFollowing={followingSet.has(installer.userId)}
                    targetName={installer.user.name ?? undefined}
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
                className="glass-card rounded-xl p-4 hover:shadow-md"
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted">{product.brand?.name}</p>
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
                    <div key={post.id} className="brag-card overflow-hidden rounded-2xl">
                      <div className="brag-card-header px-4 py-2 text-sm font-bold">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆"} {category}
                      </div>
                      <div className="p-4">
                        <Link href={`/profile/${post.author.profile?.username}`} className="text-sm font-semibold hover:text-primary">
                          {post.author.name}
                        </Link>
                        <p className="mt-1 font-medium line-clamp-2">{post.title ?? post.content.slice(0, 80)}</p>
                        <p className="mt-2 text-sm font-bold brag-accent">🏆 {post.bragScore} points</p>
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
                      <Link key={post.id} href={`/post/${post.id}`} className="brag-card rounded-2xl p-4 hover:border-brag/60">
                        <p className="text-sm font-semibold">{post.author.name}</p>
                        <p className="mt-1 line-clamp-2 font-medium">{post.title ?? post.content.slice(0, 80)}</p>
                        <p className="mt-2 text-sm font-bold brag-accent">🏆 {post.bragScore} points</p>
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
            <div className="glass-card rounded-2xl">
              {bragLeaderboard.map((installer, i) => (
                <Link
                  key={installer.id}
                  href={`/profile/${installer.username}`}
                  className="flex items-center gap-4 border-b border-border p-4 last:border-0 hover:bg-card/60"
                >
                  <span className="w-8 text-lg font-bold text-muted">#{i + 1}</span>
                  <PresenceAvatar src={installer.user.image} name={installer.user.name} lastSeenAt={installer.user.lastSeenAt} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="font-semibold">{installer.user.name}</p>
                    <p className="text-sm text-muted">🏆 {installer.bragCount} brags</p>
                  </div>
                  <span className="font-bold brag-accent">⭐ {installer.reputationScore}</span>
                </Link>
              ))}
            </div>
          )}
          {tab === "trending" && (
            <Link href="/discover?tab=leaderboard" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              View full leaderboard →
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

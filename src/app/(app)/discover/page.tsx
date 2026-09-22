import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/session";
import {
  getFollowingIds,
  getPostsByType,
  getProjects,
  getHotBrags,
  getAllTimeBrags,
  getBragOfWeek,
  getTrendingBrags,
  getTopInstallers,
  getPopularProducts,
  getBragLeaderboard,
  getPopularQuestions,
} from "@/lib/queries";
import { FollowButton } from "@/components/profile/follow-button";
import { PostCard, PostFeed } from "@/components/feed/post-card";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { Badge, MemberTierBadge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, HelpCircle, FolderKanban } from "lucide-react";
import { DiscoverTabs } from "@/components/discover/discover-tabs";
import { LeaderboardPanel } from "@/components/discover/leaderboard-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isMobileUserAgent } from "@/lib/feed-routes";
import { newLookExploreHref, classicExploreHref } from "@/lib/discover-routes";

export const metadata = { title: "Explore" };
export const dynamic = "force-dynamic";

interface DiscoverPageProps {
  searchParams: Promise<{ tab?: string; view?: string }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const session = await getSession();
  const { tab = "trending", view } = await searchParams;

  const isTrendingTab = tab === "trending" || !tab;
  if (view !== "classic" && isTrendingTab) {
    const ua = (await headers()).get("user-agent") ?? "";
    if (isMobileUserAgent(ua)) {
      redirect("/discover/watch");
    }
  }
  const userId = session?.user?.id;

  const isTrending = tab === "trending" || !tab;
  const isPeople = tab === "people";
  const isProducts = tab === "products";
  const isQuestions = tab === "questions";
  const isProjects = tab === "projects";
  const isLeaderboard = tab === "leaderboard";

  const [
    trendingBrags,
    trendingQuestions,
    topInstallers,
    bragLeaderboard,
    products,
    followingIds,
    questions,
    projects,
    hotBrags,
    bragOfWeek,
    allTime,
    fullBragLeaderboard,
  ] = await Promise.all([
    isTrending ? getTrendingBrags(6, userId) : Promise.resolve([]),
    isTrending ? getPopularQuestions(4, userId) : Promise.resolve([]),
    isTrending || isPeople ? getTopInstallers() : Promise.resolve([]),
    isTrending ? getBragLeaderboard(5) : Promise.resolve([]),
    isTrending || isProducts ? getPopularProducts() : Promise.resolve([]),
    userId && (isTrending || isPeople) ? getFollowingIds(userId) : Promise.resolve([] as string[]),
    isQuestions ? getPostsByType("QUESTION", 30, userId) : Promise.resolve([]),
    isProjects ? getProjects() : Promise.resolve([]),
    isLeaderboard ? getHotBrags(20, userId) : Promise.resolve([]),
    isLeaderboard ? getBragOfWeek(userId) : Promise.resolve([]),
    isLeaderboard ? getAllTimeBrags(4, userId) : Promise.resolve([]),
    isLeaderboard ? getBragLeaderboard(10) : Promise.resolve([]),
  ]);

  const followingSet = new Set(followingIds);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-muted">Trending installations, installers, and products</p>
        {view === "classic" ? (
          <Link href={newLookExploreHref()} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
            Switch to New look explore →
          </Link>
        ) : (
          <Link href={classicExploreHref(tab)} className="mt-2 inline-block text-sm font-medium text-muted hover:text-foreground">
            Classic explore grid
          </Link>
        )}
      </div>

      <Suspense fallback={null}>
        <DiscoverTabs />
      </Suspense>

      <AdSlot placement={AD_PLACEMENTS.COMMUNITY} className="my-4" />

      {isTrending && (
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
              <PostFeed posts={trendingQuestions} currentUserId={userId} />
            </div>
            <Link href="/discover?tab=questions" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              View all questions →
            </Link>
          </section>
        </>
      )}

      {isQuestions && (
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

      {isProjects && (
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

      {(isTrending || isPeople) && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Trending Installers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topInstallers.map((installer) => (
              <div key={installer.id} className="glass-card rounded-2xl p-4">
                <Link href={`/profile/${installer.username}`} className="flex items-center gap-3">
                  <PresenceAvatar
                    src={installer.user.image}
                    name={installer.user.name}
                    lastSeenAt={installer.user.lastSeenAt}
                  />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-semibold">{installer.user.name}</p>
                      {installer.memberTier && <MemberTierBadge tier={installer.memberTier} compact />}
                    </div>
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

      {(isTrending || isProducts) && (
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

      {isLeaderboard && (
        <LeaderboardPanel
          installers={fullBragLeaderboard}
          bragOfWeek={bragOfWeek}
          allTime={allTime}
          hotBrags={hotBrags}
          currentUserId={userId}
        />
      )}

      {isTrending && (
        <section>
          <LeaderboardPanel
            installers={bragLeaderboard}
            bragOfWeek={[]}
            allTime={[]}
            hotBrags={[]}
            preview
          />
          <Link href="/discover?tab=leaderboard" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            View full leaderboard →
          </Link>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getDiscoverData, getFollowingIds } from "@/lib/queries";
import { FollowButton } from "@/components/profile/follow-button";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatNumber } from "@/lib/utils";
import { MapPin, TrendingUp } from "lucide-react";

export const metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const session = await auth();
  const [{ trendingBrags, trendingQuestions, topInstallers, bragLeaderboard, products, jobs }, followingIds] =
    await Promise.all([
      getDiscoverData(),
      session?.user?.id ? getFollowingIds(session.user.id) : Promise.resolve([] as string[]),
    ]);
  const followingSet = new Set(followingIds);

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-gray-500">Trending installations, installers, and products</p>
      </div>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Trending Installations
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trendingBrags.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Trending Installers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topInstallers.map((installer) => (
            <div
              key={installer.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <Link href={`/profile/${installer.username}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={installer.user.image ?? undefined} />
                  <AvatarFallback>{getInitials(installer.user.name ?? "U")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{installer.user.name}</p>
                  <p className="text-sm text-gray-500">@{installer.username}</p>
                </div>
              </Link>
              <p className="mt-2 text-sm text-blue-600">⭐ {formatNumber(installer.reputationScore)}</p>
              {session?.user?.id && session.user.id !== installer.userId && (
                <div className="mt-3">
                  <FollowButton
                    userId={installer.userId}
                    initialFollowing={followingSet.has(installer.userId)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Popular Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {trendingQuestions.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
          ))}
        </div>
      </section>

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
              <Badge variant="secondary" className="mt-2">
                {product.postProducts.length} posts
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">🏆 Brag Leaderboard</h2>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {bragLeaderboard.map((installer, i) => (
            <Link
              key={installer.id}
              href={`/profile/${installer.username}`}
              className="flex items-center gap-4 border-b border-gray-100 p-4 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <span className="w-8 text-lg font-bold text-gray-400">#{i + 1}</span>
              <Avatar className="h-10 w-10">
                <AvatarImage src={installer.user.image ?? undefined} />
                <AvatarFallback>{getInitials(installer.user.name ?? "U")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{installer.user.name}</p>
                <p className="text-sm text-gray-500">🏆 {installer.bragCount} brags</p>
              </div>
              <span className="font-bold text-orange-600">⭐ {installer.reputationScore}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Jobs</h2>
          <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="font-semibold">{job.title}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" /> {job.location}
              </p>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
                {job.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

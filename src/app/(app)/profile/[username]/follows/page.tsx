import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfileByUsername, getFollowersOf, getFollowingOf, getFollowingIds } from "@/lib/queries";
import { InstallerRow } from "@/components/profile/installer-row";
import { cn } from "@/lib/utils";

interface FollowsPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ list?: string }>;
}

export async function generateMetadata({ params }: FollowsPageProps) {
  const { username } = await params;
  return { title: `@${username} connections` };
}

export default async function FollowsPage({ params, searchParams }: FollowsPageProps) {
  const { username } = await params;
  const { list } = await searchParams;
  const tab = list === "following" ? "following" : "followers";

  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const session = await auth();
  const currentUserId = session?.user?.id;

  const [followers, following, myFollowingIds, peopleWhoFollowMe] = await Promise.all([
    getFollowersOf(profile.userId),
    getFollowingOf(profile.userId),
    currentUserId ? getFollowingIds(currentUserId) : Promise.resolve([] as string[]),
    currentUserId
      ? getFollowersOf(currentUserId).then((rows) => new Set(rows.map((r) => r.followerId)))
      : Promise.resolve(new Set<string>()),
  ]);

  const myFollowing = new Set(myFollowingIds);

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <Link href={`/profile/${username}`} className="text-sm font-medium text-blue-600 hover:underline">
        ← @{username}
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{profile.user.name}</h1>

      <div className="mt-4 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <Link
          href={`/profile/${username}/follows?list=followers`}
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-medium",
            tab === "followers"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-500"
          )}
        >
          Followers · {followers.length}
        </Link>
        <Link
          href={`/profile/${username}/follows?list=following`}
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-medium",
            tab === "following"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-500"
          )}
        >
          Following · {following.length}
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {(tab === "following" ? following : followers).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700">
            {tab === "following" ? "Not following anyone yet" : "No followers yet"}
          </p>
        ) : tab === "following" ? (
          following.map((row) => (
            <InstallerRow
              key={row.following.id}
              userId={row.following.id}
              name={row.following.name}
              username={row.following.profile?.username}
              image={row.following.image}
              lastSeenAt={row.following.lastSeenAt}
              currentUserId={currentUserId}
              isFollowing={myFollowing.has(row.following.id)}
              followsYou={peopleWhoFollowMe.has(row.following.id)}
            />
          ))
        ) : (
          followers.map((row) => (
            <InstallerRow
              key={row.follower.id}
              userId={row.follower.id}
              name={row.follower.name}
              username={row.follower.profile?.username}
              image={row.follower.image}
              lastSeenAt={row.follower.lastSeenAt}
              currentUserId={currentUserId}
              isFollowing={myFollowing.has(row.follower.id)}
              followsYou={peopleWhoFollowMe.has(row.follower.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

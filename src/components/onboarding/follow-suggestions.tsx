import Link from "next/link";
import { getDiscoverData, getFollowingIds } from "@/lib/queries";
import { FollowButton } from "@/components/profile/follow-button";
import { PresenceAvatar } from "@/components/presence/presence-avatar";

export async function FollowSuggestions({ userId }: { userId: string }) {
  const [{ topInstallers }, followingIds] = await Promise.all([
    getDiscoverData(userId),
    getFollowingIds(userId),
  ]);
  const followingSet = new Set(followingIds);
  const suggestions = topInstallers
    .filter((i) => i.userId !== userId && !followingSet.has(i.userId))
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="font-semibold">Follow installers near you</p>
      <p className="mt-1 text-sm text-muted">Build your Following feed with people whose work you respect.</p>
      <div className="mt-4 space-y-3">
        {suggestions.map((installer) => (
          <div key={installer.id} className="flex items-center gap-3">
            <Link href={`/profile/${installer.username}`} className="flex min-w-0 flex-1 items-center gap-3">
              <PresenceAvatar
                src={installer.user.image}
                name={installer.user.name}
                lastSeenAt={installer.user.lastSeenAt}
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{installer.user.name}</p>
                <p className="truncate text-sm text-muted">@{installer.username}</p>
              </div>
            </Link>
            <FollowButton
              userId={installer.userId}
              currentUserId={userId}
              initialFollowing={false}
              targetName={installer.user.name ?? undefined}
            />
          </div>
        ))}
      </div>
      <Link href="/discover?tab=people" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-cyan-400">
        See more installers →
      </Link>
    </div>
  );
}

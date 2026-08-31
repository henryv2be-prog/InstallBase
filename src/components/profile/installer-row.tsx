import Link from "next/link";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { FollowButton } from "@/components/profile/follow-button";

interface InstallerRowProps {
  userId: string;
  name: string | null;
  username?: string | null;
  image?: string | null;
  lastSeenAt?: Date | string | null;
  currentUserId?: string;
  isFollowing?: boolean;
  followsYou?: boolean;
}

export function InstallerRow({
  userId,
  name,
  username,
  image,
  lastSeenAt,
  currentUserId,
  isFollowing = false,
  followsYou = false,
}: InstallerRowProps) {
  const isSelf = currentUserId === userId;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <Link href={username ? `/profile/${username}` : "#"} className="flex min-w-0 flex-1 items-center gap-3">
        <PresenceAvatar src={image} name={name} lastSeenAt={lastSeenAt} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          {username && <p className="truncate text-sm text-gray-500">@{username}</p>}
        </div>
      </Link>
      {!isSelf && currentUserId && (
        <FollowButton userId={userId} initialFollowing={isFollowing} followsYou={followsYou} />
      )}
    </div>
  );
}

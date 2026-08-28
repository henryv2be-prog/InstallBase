import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/follow-button";
import { getInitials } from "@/lib/utils";

interface InstallerRowProps {
  userId: string;
  name: string | null;
  username?: string | null;
  image?: string | null;
  currentUserId?: string;
  isFollowing?: boolean;
  followsYou?: boolean;
}

export function InstallerRow({
  userId,
  name,
  username,
  image,
  currentUserId,
  isFollowing = false,
  followsYou = false,
}: InstallerRowProps) {
  const isSelf = currentUserId === userId;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <Link href={username ? `/profile/${username}` : "#"} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar>
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback>{getInitials(name ?? "U")}</AvatarFallback>
        </Avatar>
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

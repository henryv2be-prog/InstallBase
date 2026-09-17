"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import Link from "next/link";
import { signupHref } from "@/lib/auth-urls";

interface FollowButtonProps {
  userId: string;
  currentUserId?: string;
  initialFollowing?: boolean;
  followsYou?: boolean;
  targetName?: string;
}

export function FollowButton({
  userId,
  currentUserId,
  initialFollowing = false,
  followsYou = false,
  targetName,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (currentUserId === userId) return null;

  if (!currentUserId) {
    const label = targetName ? `Join to follow ${targetName}` : "Join to follow";
    return (
      <Button size="sm" asChild title={label}>
        <Link href={signupHref()}>
          <UserPlus className="h-4 w-4" />
          Follow
        </Link>
      </Button>
    );
  }

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const previous = following;
      setFollowing(!previous);
      try {
        const result = await toggleFollow(userId);
        setFollowing(result.following ?? !previous);
        router.refresh();
        if (!previous) toast.success("Following — see their posts in your Following feed");
      } catch {
        setFollowing(previous);
        toast.error("Failed to update follow");
      }
    });
  };

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={pending}
    >
      {following ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {followsYou ? "Follow back" : "Follow"}
        </>
      )}
    </Button>
  );
}

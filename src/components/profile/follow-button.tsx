"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  followsYou?: boolean;
}

export function FollowButton({
  userId,
  initialFollowing = false,
  followsYou = false,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

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

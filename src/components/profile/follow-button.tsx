"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";

export function FollowButton({ userId, initialFollowing = false }: { userId: string; initialFollowing?: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  const handleFollow = () => {
    startTransition(async () => {
      try {
        const result = await toggleFollow(userId);
        setFollowing(result.following ?? false);
      } catch {
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
          Follow
        </>
      )}
    </Button>
  );
}

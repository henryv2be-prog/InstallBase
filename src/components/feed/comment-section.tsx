"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/actions";
import { getInitials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { toast } from "sonner";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string | null;
    image: string | null;
    profile: { username: string } | null;
  };
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
}: {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
}) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!content.trim()) return;
    if (!currentUserId) {
      toast.error("Sign in to comment");
      return;
    }
    startTransition(async () => {
      try {
        await addComment(postId, content);
        setContent("");
        toast.success("Comment added");
      } catch {
        toast.error("Failed to add comment");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 font-bold">Comments ({comments.length})</h3>
      {currentUserId && (
        <div className="mb-4 flex gap-3">
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button onClick={handleSubmit} disabled={pending} className="self-end">
            Post
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(comment.author.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${comment.author.profile?.username}`}
                  className="text-sm font-semibold hover:text-blue-600"
                >
                  {comment.author.name}
                </Link>
                <span className="text-xs text-gray-500">
                  <RelativeTime date={comment.createdAt} />
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

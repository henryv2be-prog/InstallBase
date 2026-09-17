"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment, getCommentPreview } from "@/lib/actions";
import { getInitials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { toast } from "sonner";
import { GuestInlineCta } from "@/components/auth/guest-cta";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

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

export function InlineComments({
  postId,
  commentCount,
  initialComments = [],
  currentUserId,
  defaultOpen = false,
}: {
  postId: string;
  commentCount: number;
  initialComments?: Comment[];
  currentUserId?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loaded, setLoaded] = useState(initialComments.length > 0);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    getCommentPreview(postId)
      .then((rows) => {
        setComments(rows.reverse());
        setLoaded(true);
      })
      .catch(() => toast.error("Could not load comments"))
      .finally(() => setLoading(false));
  }, [open, loaded, postId]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    if (!currentUserId) {
      toast.error("Join to comment");
      return;
    }
    startTransition(async () => {
      try {
        await addComment(postId, content);
        setContent("");
        toast.success("Comment added");
        const rows = await getCommentPreview(postId);
        setComments(rows.reverse());
        setLoaded(true);
      } catch {
        toast.error("Failed to add comment");
      }
    });
  };

  if (commentCount === 0 && !open) return null;

  return (
    <div className="border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted hover:text-foreground"
      >
        <span>{commentCount} comment{commentCount === 1 ? "" : "s"}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {currentUserId ? (
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleSubmit} disabled={pending} className="self-end">
                Post
              </Button>
            </div>
          ) : (
            <GuestInlineCta action="comment on this install" next={`/post/${postId}`} />
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading comments...
            </div>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={comment.author.image ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(comment.author.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/profile/${comment.author.profile?.username}`}
                    className="text-sm font-semibold hover:text-blue-600"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-xs text-muted">
                    <RelativeTime date={comment.createdAt} />
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{comment.content}</p>
              </div>
            </div>
          ))}

          {commentCount > comments.length && (
            <Link href={`/post/${postId}`} className="text-sm font-semibold text-blue-600 hover:underline dark:text-cyan-400">
              View all {commentCount} comments
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

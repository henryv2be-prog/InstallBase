"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MessageCircle, Share2, Trophy } from "lucide-react";
import type { PostCardData } from "@/lib/queries";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { FollowButton } from "@/components/profile/follow-button";
import { InlineComments } from "@/components/feed/inline-comments";
import { toggleMediaBragPoint } from "@/lib/actions";
import { isBraggableType } from "@/lib/brag";
import { mediaForImmersiveDisplay } from "@/lib/immersive-feed-media";
import { getPostIntentLabel, getPostTradeGroupLabel, shouldShowPostLocation } from "@/lib/work-posts";
import { promptJoin } from "@/components/auth/guest-cta";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImmersiveSlideOverlayProps {
  post: PostCardData;
  currentUserId?: string;
  followingIds?: Set<string>;
}

export function ImmersiveSlideOverlay({ post, currentUserId, followingIds }: ImmersiveSlideOverlayProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const profile = post.author.profile;
  const media = mediaForImmersiveDisplay(post);
  const bragTarget = media[0];
  const canBrag = isBraggableType(post.type) && Boolean(bragTarget?.id);
  const [bragScore, setBragScore] = useState(bragTarget?.bragScore ?? post.bragScore);
  const [bragged, setBragged] = useState(bragTarget?.braggedByViewer ?? false);

  const trade = getPostTradeGroupLabel(post);
  const intentLabel = post.postIntent !== "GENERAL" ? getPostIntentLabel(post.postIntent) : null;
  const showLocation = shouldShowPostLocation({
    location: post.location,
    showExactLocation: post.showExactLocation,
    postIntent: post.postIntent,
    type: post.type,
    inPortfolio: post.inPortfolio,
  });

  const commentCount = post.type === "QUESTION" ? post._count.answers : post._count.comments;

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.author.name ?? "InstallBase", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Could not share");
    }
  };

  const handleBrag = () => {
    if (!bragTarget?.id) return;
    if (!currentUserId) {
      promptJoin("give brag points");
      return;
    }
    const was = bragged;
    const prev = bragScore;
    setBragged(!was);
    setBragScore(was ? Math.max(0, prev - 1) : prev + 1);

    startTransition(async () => {
      const result = await toggleMediaBragPoint(bragTarget.id!);
      if (result.error) {
        setBragged(was);
        setBragScore(prev);
        toast.error(result.error);
        return;
      }
      if (result.mediaBragScore !== undefined) setBragScore(result.mediaBragScore);
      if (result.bragged !== undefined) setBragged(result.bragged);
    });
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 pb-[var(--immersive-overlay-bottom-pad,1.25rem)] text-white pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link href={profile ? `/profile/${profile.username}` : "#"} className="flex min-w-0 flex-1 items-center gap-2">
            <PresenceAvatar
              src={post.author.image}
              name={post.author.name}
              lastSeenAt={post.author.lastSeenAt}
              className="h-10 w-10 border border-white/20"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold">{post.author.name}</p>
              <p className="truncate text-xs text-white/75">
                {[trade, intentLabel].filter(Boolean).join(" · ") || `@${profile?.username}`}
              </p>
            </div>
          </Link>
          <FollowButton
            userId={post.authorId}
            currentUserId={currentUserId}
            initialFollowing={followingIds?.has(post.authorId)}
            targetName={post.author.name?.split(" ")[0]}
          />
        </div>

        {post.content && (
          <p className="line-clamp-3 text-sm leading-snug text-white/90">{post.content}</p>
        )}

        {showLocation && post.location && (
          <p className="text-xs text-white/70">{post.location}</p>
        )}

        <div className="flex items-center gap-2">
          {canBrag && (
            <button
              type="button"
              disabled={pending}
              onClick={handleBrag}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-95",
                bragged ? "bg-orange-500 text-white" : "bg-white/15 text-orange-200 backdrop-blur-sm"
              )}
            >
              <Trophy className="h-4 w-4" />
              {bragScore > 0 ? bragScore : "Brag"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {commentsOpen && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end bg-black/50 pointer-events-auto"
          onClick={() => setCommentsOpen(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[min(72dvh,82%)] flex-col rounded-t-2xl bg-card text-foreground shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-labelledby={`comments-sheet-${post.id}`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <h3 id={`comments-sheet-${post.id}`} className="font-semibold">
                Comments{commentCount > 0 ? ` (${commentCount})` : ""}
              </h3>
              <button type="button" className="text-sm text-muted" onClick={() => setCommentsOpen(false)}>
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3">
              <InlineComments
                postId={post.id}
                commentCount={commentCount}
                currentUserId={currentUserId}
                defaultOpen
                fullList
                hideToggle
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

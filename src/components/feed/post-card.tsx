"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trophy,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge, ReputationBadge, VerifiedBadge } from "@/components/ui/badge";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { Button } from "@/components/ui/button";
import { cn, getReputationLabel, getFeedReasonLabel } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MediaGallery } from "@/components/ui/media-gallery";
import { PostOptionsMenu } from "@/components/feed/post-options-menu";
import { InlineComments } from "@/components/feed/inline-comments";
import {
  toggleLike,
  toggleBookmark,
  toggleBragPoint,
} from "@/lib/actions";
import { toast } from "sonner";
import type { PostCardData } from "@/lib/queries";
import { compactBragDetails, isBraggableType } from "@/lib/brag";
import { promptJoin } from "@/components/auth/guest-cta";
import { EmptyState } from "@/components/ui/empty-state";
import { Camera } from "lucide-react";

interface PostCardProps {
  post: PostCardData;
  currentUserId?: string;
  showFull?: boolean;
  showInlineComments?: boolean;
  feedContext?: "following" | "popular";
  followingIds?: Set<string>;
}

export function PostCard({
  post,
  currentUserId,
  showFull = false,
  showInlineComments = false,
  feedContext,
  followingIds,
}: PostCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const profile = post.author.profile;
  const [liked, setLiked] = useState(
    currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [bragged, setBragged] = useState(
    currentUserId ? post.bragPoints.some((b) => b.userId === currentUserId) : false
  );
  const [bragScore, setBragScore] = useState(post.bragScore);
  const isSaved = currentUserId ? post.bookmarks.some((b) => b.userId === currentUserId) : false;
  const bragDetails = compactBragDetails(post.bragDetails);
  const canBrag = isBraggableType(post.type);
  const commentCount = post.type === "QUESTION" ? post._count.answers : post._count.comments;
  const reasonLabel = feedContext ? getFeedReasonLabel(post, feedContext, followingIds) : null;

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    const title = post.title || `${post.author.name} on InstallBase`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: post.content.slice(0, 140), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Could not share");
    }
  };

  const handleLike = () => {
    if (!currentUserId) {
      promptJoin("like posts");
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((count) => (wasLiked ? count - 1 : count + 1));
    startTransition(async () => {
      try {
        const result = await toggleLike(post.id);
        if (result.likeCount !== undefined) setLikeCount(result.likeCount);
        if (result.liked !== undefined) setLiked(result.liked);
        router.refresh();
      } catch {
        setLiked(wasLiked);
        setLikeCount((count) => (wasLiked ? count + 1 : count - 1));
        toast.error("Could not update like");
      }
    });
  };

  const handleBrag = () => {
    if (!currentUserId) {
      promptJoin("give brag points");
      return;
    }
    const wasBragged = bragged;
    setBragged(!wasBragged);
    setBragScore((score) => (wasBragged ? score - 1 : score + 1));
    startTransition(async () => {
      try {
        const result = await toggleBragPoint(post.id);
        if (result.error) {
          setBragged(wasBragged);
          setBragScore((score) => (wasBragged ? score + 1 : score - 1));
          toast.error(result.error);
          return;
        }
        if (result.bragScore !== undefined) setBragScore(result.bragScore);
        if (result.bragged !== undefined) setBragged(result.bragged);
        router.refresh();
      } catch {
        setBragged(wasBragged);
        setBragScore((score) => (wasBragged ? score + 1 : score - 1));
        toast.error("Could not update brag points");
      }
    });
  };

  const handleBookmark = () => {
    if (!currentUserId) {
      promptJoin("save posts");
      return;
    }
    startTransition(async () => {
      try {
        const result = await toggleBookmark(post.id);
        if (result.saved) {
          toast.success("Saved to your profile");
        } else {
          toast.success("Removed from saved");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  const typeBadge = {
    BRAG: { label: null, variant: "brag" as const },
    QUESTION: { label: "❓ Question", variant: "question" as const },
    PROJECT: { label: "📋 Project", variant: "default" as const },
    VIDEO: { label: "🎥 How I Did It", variant: "secondary" as const },
    POST: { label: null, variant: "secondary" as const },
  }[post.type];

  const toggleComments = () => {
    if (!showInlineComments) return;
    setCommentsOpen((v) => !v);
  };

  return (
    <article
      className={cn(
        "glass-card glow-border overflow-hidden transition-all duration-200 hover:shadow-lg",
        bragScore > 0 && "border-orange-500/30 dark:border-orange-500/20"
      )}
    >
      <div className="p-5">
        {reasonLabel && (
          <p className="mb-3 text-xs font-medium text-muted">{reasonLabel}</p>
        )}
        <div className="flex items-start justify-between gap-3">
          <Link href={`/profile/${profile?.username}`} className="flex items-center gap-3 group">
            <PresenceAvatar
              src={post.author.image}
              name={post.author.name}
              lastSeenAt={post.author.lastSeenAt}
              className="h-11 w-11"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold group-hover:text-blue-600 transition-colors">
                  {post.author.name}
                </span>
                {profile?.verified && <VerifiedBadge />}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>@{profile?.username}</span>
                <span>·</span>
                <span><RelativeTime date={post.createdAt} /></span>
              </div>
            </div>
          </Link>
          <PostOptionsMenu postId={post.id} authorId={post.authorId} currentUserId={currentUserId} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {typeBadge.label && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
          {post.solved && <Badge variant="success">🟢 Solved</Badge>}
          {profile && (
            <ReputationBadge score={profile.reputationScore} level={profile.reputationLevel} />
          )}
        </div>

        {post.title && (
          <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{post.title}</h3>
        )}

        <p className={cn("mt-2 text-foreground/80 dark:text-slate-300", !showFull && "line-clamp-4")}>
          {post.content}
        </p>

        {bragDetails && (
          <ul className="mt-3 space-y-1 rounded-xl bg-orange-50 p-4 text-sm dark:bg-orange-950/30">
            {Object.entries(bragDetails).map(([key, value]) => (
              <li key={key} className="flex gap-2">
                <span className="text-orange-600">•</span>
                <span>
                  <strong className="capitalize">{key.replace(/_/g, " ")}:</strong> {String(value)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {post.location && (
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {post.location}
          </div>
        )}

        {post.media.length > 0 && (
          <div className="mt-4">
            <MediaGallery
              items={post.media.map((m) => ({
                url: m.url,
                type: m.type,
                caption: m.caption,
              }))}
              limit={showFull ? undefined : 4}
            />
          </div>
        )}

        {post.products.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Equipment used
            </p>
            <div className="flex flex-wrap gap-2">
              {post.products.map(({ product }) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Badge variant="outline" className="hover:bg-gray-50">
                    {product.brand?.name} {product.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="secondary">#{tag.name}</Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={handleLike}
              className={cn(liked && "text-red-500")}
              aria-label="Like"
              title={currentUserId ? "Like" : "Join to like posts"}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {likeCount}
            </Button>

            {showInlineComments ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleComments}
                aria-label="Comment"
              >
                <MessageCircle className="h-4 w-4" />
                {commentCount}
              </Button>
            ) : (
              <Link href={`/post/${post.id}`}>
                <Button variant="ghost" size="sm" aria-label="Comment">
                  <MessageCircle className="h-4 w-4" />
                  {commentCount}
                </Button>
              </Link>
            )}

            {canBrag && (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={handleBrag}
                className={cn(bragged && "text-orange-500")}
                aria-label="Give brag points"
                title={currentUserId ? "Give brag points" : "Join to give brag points"}
              >
                <Trophy className={cn("h-4 w-4", bragged && "fill-current")} />
                {bragScore}
              </Button>
            )}
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[160px] rounded-xl border border-border bg-card p-1 shadow-lg"
                align="end"
                sideOffset={4}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
                  onSelect={handleBookmark}
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-current text-blue-500")} />
                  {isSaved ? "Unsave" : "Save post"}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
                  onSelect={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {canBrag && bragScore > 0 && (
          <div className="mt-2 text-center text-sm font-semibold brag-accent">
            🏆 {bragScore} Brag Points
          </div>
        )}

        {showInlineComments && commentsOpen && (
          <InlineComments
            postId={post.id}
            commentCount={commentCount}
            currentUserId={currentUserId}
            defaultOpen
          />
        )}
      </div>
    </article>
  );
}

export function PostFeed({
  posts,
  currentUserId,
  showInlineComments = false,
  feedContext,
  followingIds,
  emptyTitle = "No posts yet",
  emptyDescription = "Be the first to share an installation!",
  emptyAction,
}: {
  posts: PostCardData[];
  currentUserId?: string;
  showInlineComments?: boolean;
  feedContext?: "following" | "popular";
  followingIds?: Set<string>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; href: string };
}) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          showInlineComments={showInlineComments}
          feedContext={feedContext}
          followingIds={followingIds}
        />
      ))}
    </div>
  );
}

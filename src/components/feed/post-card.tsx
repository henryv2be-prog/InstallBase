"use client";

import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trophy,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { Badge, ReputationBadge, VerifiedBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getInitials, getReputationLabel } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MediaGallery } from "@/components/ui/media-gallery";
import {
  toggleLike,
  toggleBookmark,
  toggleBragPoint,
} from "@/lib/actions";
import { toast } from "sonner";
import { useTransition } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { postInclude } from "@/lib/queries";

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

interface PostCardProps {
  post: PostWithRelations;
  currentUserId?: string;
  showFull?: boolean;
}

export function PostCard({ post, currentUserId, showFull = false }: PostCardProps) {
  const [pending, startTransition] = useTransition();
  const profile = post.author.profile;
  const isLiked = currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false;
  const isSaved = currentUserId ? post.bookmarks.some((b) => b.userId === currentUserId) : false;
  const hasBragged = currentUserId ? post.bragPoints.some((b) => b.userId === currentUserId) : false;
  const bragDetails = post.bragDetails as Record<string, unknown> | null;

  const handleAction = (action: () => Promise<unknown>) => {
    if (!currentUserId) {
      toast.error("Sign in to interact");
      return;
    }
    startTransition(async () => {
      try {
        await action();
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  const typeBadge = {
    BRAG: { label: "🏆 BRAG", variant: "brag" as const },
    QUESTION: { label: "❓ Question", variant: "question" as const },
    PROJECT: { label: "📋 Project", variant: "default" as const },
    VIDEO: { label: "🎥 How I Did It", variant: "secondary" as const },
    POST: { label: null, variant: "secondary" as const },
  }[post.type];

  return (
    <article
      className={cn(
        "glass-card glow-border overflow-hidden transition-all duration-200 hover:shadow-lg",
        post.type === "BRAG" && "border-orange-500/30 dark:border-orange-500/20"
      )}
    >
      {post.type === "BRAG" && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 py-2 text-sm font-bold tracking-wide text-white shadow-lg shadow-orange-500/20">
          🏆 BRAG
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/profile/${profile?.username}`} className="flex items-center gap-3 group">
            <Avatar className="h-11 w-11">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback>{getInitials(post.author.name ?? "U")}</AvatarFallback>
            </Avatar>
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
          <Button variant="ghost" size="icon" className="shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
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

        {post.type === "BRAG" && bragDetails && (
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
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => handleAction(() => toggleLike(post.id))}
              className={cn(isLiked && "text-red-500")}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              {post.likes.length}
            </Button>
            <Link href={`/post/${post.id}`}>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4" />
                {post.type === "QUESTION" ? post.answers.length : post.comments.length}
              </Button>
            </Link>
            {post.type === "BRAG" && (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => handleAction(() => toggleBragPoint(post.id))}
                className={cn(hasBragged && "text-orange-500")}
              >
                <Trophy className={cn("h-4 w-4", hasBragged && "fill-current")} />
                {post.bragScore}
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => handleAction(() => toggleBookmark(post.id))}
            className={cn(isSaved && "text-blue-500")}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>

        {post.type === "BRAG" && (
          <div className="mt-2 text-center text-sm font-semibold text-orange-600">
            🏆 {post.bragScore} Brag Points
          </div>
        )}
      </div>
    </article>
  );
}

export function PostFeed({ posts, currentUserId }: { posts: PostWithRelations[]; currentUserId?: string }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">No posts yet</p>
        <p className="mt-2 text-gray-500">Be the first to share an installation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

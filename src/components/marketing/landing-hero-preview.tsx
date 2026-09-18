import type { ReactNode } from "react";
import { PostCard } from "@/components/feed/post-card";
import { Badge } from "@/components/ui/badge";
import { LandingPostPreview, LANDING_EXAMPLE_POSTS } from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

const STACK_SIZE = 3;

const DESKTOP_CARD_POSITIONS = [
  "left-0 top-0 z-10 w-[88%] rotate-[-1.5deg] sm:w-[78%]",
  "right-0 top-8 z-20 w-[72%] rotate-[1.5deg] sm:top-10 sm:w-[62%]",
  "bottom-0 left-[8%] z-30 w-[80%] sm:left-[12%] sm:w-[70%]",
] as const;

const MOBILE_CARD_POSITIONS = [
  "left-0 top-0 z-10 w-[84%] rotate-[-1deg]",
  "right-0 top-3 z-20 w-[70%] rotate-[1deg]",
  "bottom-0 left-[10%] z-30 w-[78%]",
] as const;

const POSITIONS_BY_COUNT: Record<number, readonly number[]> = {
  1: [2],
  2: [1, 2],
  3: [0, 1, 2],
};

interface LandingHeroPreviewProps {
  posts?: PostCardData[];
}

function pickHeroStackPosts(sources: PostCardData[]): PostCardData[] {
  const seen = new Set<string>();
  const withMedia: PostCardData[] = [];
  const withoutMedia: PostCardData[] = [];

  for (const post of sources) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    if (post.media.length > 0) withMedia.push(post);
    else withoutMedia.push(post);
  }

  return [...withMedia, ...withoutMedia].slice(0, STACK_SIZE);
}

function postTypeBadge(type: PostCardData["type"]) {
  switch (type) {
    case "QUESTION":
      return { label: "Question", variant: "question" as const };
    case "BRAG":
      return { label: "Brag", variant: "brag" as const };
    case "VIDEO":
      return { label: "How I Did It", variant: "secondary" as const };
    case "PROJECT":
      return { label: "Project", variant: "default" as const };
    default:
      return null;
  }
}

/** Compact glass card for the mobile hero deck — fixed height, no overflow. */
function LandingHeroPostCard({ post, compact = false }: { post: PostCardData; compact?: boolean }) {
  const profile = post.author.profile;
  const media = post.media[0];
  const typeBadge = postTypeBadge(post.type);
  const initials = (post.author.name ?? profile?.username ?? "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        "glass-card glow-border overflow-hidden",
        post.type === "BRAG" && "border-orange-500/25"
      )}
    >
      <div className={cn("p-3", !compact && "p-3.5")}>
        <div className="flex items-center gap-2.5">
          {post.author.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.image}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-500/20 text-[10px] font-bold uppercase text-blue-600 dark:text-cyan-400"
              aria-hidden
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{post.author.name}</p>
            <p className="truncate text-xs text-muted">@{profile?.username}</p>
          </div>
        </div>

        {typeBadge && (
          <div className="mt-2">
            <Badge variant={typeBadge.variant} className="text-[10px]">
              {typeBadge.label}
            </Badge>
          </div>
        )}

        {post.title && (
          <h3
            className={cn(
              "mt-2 font-bold text-foreground",
              compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-sm"
            )}
          >
            {post.title}
          </h3>
        )}

        <p
          className={cn(
            "mt-1 text-foreground/80",
            compact ? "line-clamp-2 text-xs" : "line-clamp-2 text-xs"
          )}
        >
          {post.content}
        </p>

        {media && (
          <div className="mt-2 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.url}
              alt={media.caption ?? "Install photo"}
              className={cn(
                "w-full bg-muted object-cover",
                compact ? "aspect-[16/10] max-h-24" : "aspect-[16/10] max-h-28"
              )}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>
    </article>
  );
}

function HeroStackPostCard({ post, index }: { post: PostCardData; index: number }) {
  const isFront = index === 0;

  return (
    <div
      className={cn(
        "origin-top",
        isFront ? "scale-[0.94] sm:scale-100" : "scale-[0.92] sm:scale-[0.96]"
      )}
    >
      <PostCard post={post} bragPresentation="compact" showInlineComments={false} />
    </div>
  );
}

function HeroCardStack({
  cards,
  positions,
  className,
  minHeight,
}: {
  cards: ReactNode[];
  positions: readonly string[];
  className?: string;
  minHeight: string;
}) {
  const slotIndexes = POSITIONS_BY_COUNT[Math.min(cards.length, STACK_SIZE)] ?? POSITIONS_BY_COUNT[3];

  return (
    <div className={cn("relative mx-auto w-full", className)}>
      <div className={cn("relative overflow-hidden", minHeight)}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "pointer-events-none absolute shadow-2xl shadow-black/20",
              positions[slotIndexes[index]]
            )}
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileHeroStack({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) {
    return (
      <HeroCardStack
        positions={MOBILE_CARD_POSITIONS}
        minHeight="min-h-[13.5rem]"
        className="max-w-[17.5rem]"
        cards={[
          <LandingPostPreview key={LANDING_EXAMPLE_POSTS[0].id} post={LANDING_EXAMPLE_POSTS[0]} compact />,
          <LandingPostPreview key={LANDING_EXAMPLE_POSTS[2].id} post={LANDING_EXAMPLE_POSTS[2]} compact />,
          <LandingPostPreview key={LANDING_EXAMPLE_POSTS[5].id} post={LANDING_EXAMPLE_POSTS[5]} compact />,
        ]}
      />
    );
  }

  return (
    <HeroCardStack
      positions={MOBILE_CARD_POSITIONS}
      minHeight="min-h-[13.5rem]"
      className="max-w-[17.5rem]"
      cards={posts.map((post, index) => (
        <LandingHeroPostCard key={post.id} post={post} compact={index > 0} />
      ))}
    />
  );
}

function DesktopHeroStack({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) {
    return (
      <HeroCardStack
        positions={DESKTOP_CARD_POSITIONS}
        minHeight="min-h-[460px] lg:min-h-[520px]"
        className="max-w-md lg:max-w-none"
        cards={[
          <LandingPostPreview key={LANDING_EXAMPLE_POSTS[0].id} post={LANDING_EXAMPLE_POSTS[0]} />,
          <LandingPostPreview key={LANDING_EXAMPLE_POSTS[2].id} post={LANDING_EXAMPLE_POSTS[2]} compact />,
          <LandingPostPreview key={LANDING_EXAMPLE_POSTS[5].id} post={LANDING_EXAMPLE_POSTS[5]} compact />,
        ]}
      />
    );
  }

  return (
    <HeroCardStack
      positions={DESKTOP_CARD_POSITIONS}
      minHeight="min-h-[460px] lg:min-h-[520px]"
      className="max-w-md lg:max-w-none"
      cards={posts.map((post, index) => (
        <HeroStackPostCard key={post.id} post={post} index={index} />
      ))}
    />
  );
}

/** Stacked glass post cards — compact deck on mobile, full cards on desktop. */
export function LandingHeroPreview({ posts = [] }: LandingHeroPreviewProps) {
  const heroPosts = pickHeroStackPosts(posts);

  return (
    <>
      <div className="sm:hidden">
        <MobileHeroStack posts={heroPosts} />
      </div>
      <div className="hidden sm:block">
        <DesktopHeroStack posts={heroPosts} />
      </div>
    </>
  );
}

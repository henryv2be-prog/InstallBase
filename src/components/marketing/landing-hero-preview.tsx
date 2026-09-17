import type { ReactNode } from "react";
import { PostCard } from "@/components/feed/post-card";
import { LandingPostPreview, LANDING_EXAMPLE_POSTS } from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

const STACK_SIZE = 3;

const CARD_POSITIONS = [
  "left-0 top-0 z-10 w-[88%] rotate-[-1.5deg] sm:w-[78%]",
  "right-0 top-8 z-20 w-[72%] rotate-[1.5deg] sm:top-10 sm:w-[62%]",
  "bottom-0 left-[8%] z-30 w-[80%] sm:left-[12%] sm:w-[70%]",
] as const;

/** Which stack slots to use when fewer than three cards are available. */
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
  className,
  minHeight = "min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]",
}: {
  cards: ReactNode[];
  className?: string;
  minHeight?: string;
}) {
  const slotIndexes = POSITIONS_BY_COUNT[Math.min(cards.length, STACK_SIZE)] ?? POSITIONS_BY_COUNT[3];

  return (
    <div className={cn("relative mx-auto w-full max-w-md lg:max-w-none", className)}>
      <div className={cn("relative", minHeight)}>
        {cards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "pointer-events-none absolute shadow-2xl shadow-black/20",
              CARD_POSITIONS[slotIndexes[index]]
            )}
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoHeroStack() {
  return (
    <HeroCardStack
      cards={[
        <LandingPostPreview key={LANDING_EXAMPLE_POSTS[0].id} post={LANDING_EXAMPLE_POSTS[0]} />,
        <LandingPostPreview key={LANDING_EXAMPLE_POSTS[2].id} post={LANDING_EXAMPLE_POSTS[2]} compact />,
        <LandingPostPreview key={LANDING_EXAMPLE_POSTS[5].id} post={LANDING_EXAMPLE_POSTS[5]} compact />,
      ]}
    />
  );
}

/** Stacked glass post cards — real community posts when available. */
export function LandingHeroPreview({ posts = [] }: LandingHeroPreviewProps) {
  const heroPosts = pickHeroStackPosts(posts);

  if (heroPosts.length === 0) {
    return <DemoHeroStack />;
  }

  return (
    <HeroCardStack
      cards={heroPosts.map((post, index) => (
        <HeroStackPostCard key={post.id} post={post} index={index} />
      ))}
    />
  );
}

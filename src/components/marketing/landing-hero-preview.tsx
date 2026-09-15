import type { ReactNode } from "react";
import { PostCard } from "@/components/feed/post-card";
import { LandingPostPreview, LANDING_EXAMPLE_POSTS } from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface LandingHeroPreviewProps {
  posts?: PostCardData[];
}

function HeroCardStack({
  cards,
  className,
}: {
  cards: ReactNode[];
  className?: string;
}) {
  const positions = [
    "left-0 top-0 z-10 w-[88%] rotate-[-1.5deg] sm:w-[78%]",
    "right-0 top-8 z-20 w-[72%] rotate-[1.5deg] sm:top-10 sm:w-[62%]",
    "bottom-0 left-[8%] z-30 w-[80%] sm:left-[12%] sm:w-[70%]",
  ];

  return (
    <div className={cn("relative mx-auto w-full max-w-md lg:max-w-none", className)}>
      <div className="relative min-h-[420px] sm:min-h-[460px] lg:min-h-[520px]">
        {cards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "pointer-events-none absolute shadow-2xl shadow-black/20",
              positions[index]
            )}
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Stacked InstallBase post cards — live feed when available. */
export function LandingHeroPreview({ posts = [] }: LandingHeroPreviewProps) {
  const live = posts.filter((post) => post.media.length > 0).slice(0, 3);

  if (live.length >= 3) {
    return (
      <HeroCardStack
        cards={live.map((post) => (
          <div key={post.id} className="origin-top scale-[0.94] sm:scale-100">
            <PostCard post={post} bragPresentation="compact" showInlineComments={false} />
          </div>
        ))}
      />
    );
  }

  const featured = LANDING_EXAMPLE_POSTS[0];
  const secondary = LANDING_EXAMPLE_POSTS[2];
  const question = LANDING_EXAMPLE_POSTS[5];

  return (
    <HeroCardStack
      cards={[
        <LandingPostPreview key={featured.id} post={featured} />,
        <LandingPostPreview key={secondary.id} post={secondary} compact />,
        <LandingPostPreview key={question.id} post={question} compact />,
      ]}
    />
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";
import {
  LandingPostPreview,
  LANDING_EXAMPLE_POSTS,
} from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";

interface LandingShowcaseProps {
  posts?: PostCardData[];
}

export function LandingShowcase({ posts = [] }: LandingShowcaseProps) {
  const hasLivePosts = posts.length > 0;
  const examples = LANDING_EXAMPLE_POSTS.filter((p) => p.id !== "question").slice(0, 6);

  return (
    <section className="relative z-10 border-t border-border py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              See what installers are sharing
            </h2>
            <p className="mt-3 text-muted">
              Real installations, technical questions, and the work people are proud of — posted the
              way you would on site.
            </p>
          </div>
          <Link href="/feed" className="shrink-0">
            <Button variant="outline" className="w-full sm:w-auto">
              Explore InstallBase
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {hasLivePosts ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 6).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                bragPresentation="compact"
                showInlineComments={false}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((post) => (
              <LandingPostPreview key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";
import {
  LandingPostPreview,
  LANDING_EXAMPLE_POSTS,
} from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";

const PREVIEW_LIMIT = 2;

interface LandingFeedWindowProps {
  posts: PostCardData[];
}

export function LandingFeedWindow({ posts }: LandingFeedWindowProps) {
  const livePosts = posts.filter((post) => post.media.length > 0).slice(0, PREVIEW_LIMIT);
  const hasLivePosts = livePosts.length > 0;
  const examples = LANDING_EXAMPLE_POSTS.slice(0, PREVIEW_LIMIT);

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">
            Live feed preview
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
            What installers are posting
          </h2>
        </div>
        <Link href="/feed" className="shrink-0">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Open full feed
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm ring-1 ring-border/60">
        <div className="border-b border-border bg-card/70 px-4 py-2.5">
          <div className="flex flex-1 rounded-xl bg-background/60 p-1">
            <span className="flex-1 rounded-lg bg-card py-1.5 text-center text-sm font-semibold shadow-sm">
              Popular
            </span>
            <span className="flex-1 py-1.5 text-center text-sm text-muted">Following</span>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          {hasLivePosts
            ? livePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  bragPresentation="compact"
                  showInlineComments={false}
                />
              ))
            : examples.map((post) => <LandingPostPreview key={post.id} post={post} compact />)}
        </div>

        <div className="border-t border-border bg-card/50 px-4 py-3 text-center sm:py-4">
          <p className="mb-3 text-sm text-muted">
            {hasLivePosts
              ? "A quick preview — open the feed for everything installers are sharing."
              : "Join to see the live community feed."}
          </p>
          <Link href="/feed">
            <Button className="w-full sm:w-auto">
              Explore the full feed
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, HelpCircle, Trophy, Users } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { InstallerLeaderboardList } from "@/components/discover/leaderboard-panel";
import { Button } from "@/components/ui/button";
import {
  LandingPostPreview,
  LANDING_EXAMPLE_POSTS,
} from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";

type InstallerRow = {
  id: string;
  username: string;
  bragCount: number;
  totalBragPoints: number;
  user: {
    name: string | null;
    image: string | null;
    lastSeenAt: Date | null;
  };
};

interface LandingCommunityRailProps {
  questions: PostCardData[];
  trendingBrags: PostCardData[];
  installers: InstallerRow[];
}

export function LandingCommunityRail({
  questions,
  trendingBrags,
  installers,
}: LandingCommunityRailProps) {
  const liveQuestions = questions.slice(0, 2);
  const liveBrags = trendingBrags.filter((post) => post.media.length > 0).slice(0, 2);
  const exampleQuestion = LANDING_EXAMPLE_POSTS.find((post) => post.type === "question");
  const exampleBrag = LANDING_EXAMPLE_POSTS.find((post) => post.type === "brag");

  return (
    <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
      <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="font-bold">Questions on site</h3>
          </div>
          <Link href="/questions" className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {liveQuestions.length > 0
            ? liveQuestions.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  bragPresentation="compact"
                  showInlineComments={false}
                />
              ))
            : exampleQuestion
              ? <LandingPostPreview post={exampleQuestion} compact />
              : null}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-500" />
            <h3 className="font-bold">Bragged this week</h3>
          </div>
          <Link href="/brags" className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
            Leaderboard
          </Link>
        </div>
        <div className="space-y-3">
          {liveBrags.length > 0
            ? liveBrags.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  bragPresentation="compact"
                  showInlineComments={false}
                />
              ))
            : exampleBrag
              ? <LandingPostPreview post={exampleBrag} compact />
              : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted" />
            <h3 className="font-bold">Installers building reputation</h3>
          </div>
          <Link href="/discover?tab=leaderboard">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              See board
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <InstallerLeaderboardList installers={installers} limit={5} />
      </section>
    </aside>
  );
}

import Link from "next/link";
import { ArrowRight, HelpCircle, Trophy, Users } from "lucide-react";
import { PostCard } from "@/components/feed/post-card";
import { InstallerLeaderboardList } from "@/components/discover/leaderboard-panel";
import { Button } from "@/components/ui/button";
import {
  LandingPostPreview,
  LANDING_EXAMPLE_POSTS,
} from "@/components/marketing/landing-post-preview";
import { formatNumber } from "@/lib/utils";
import type { PostCardData } from "@/lib/queries";
import type { LandingCommunityStats } from "@/components/marketing/landing-trust-bar";

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
  stats: LandingCommunityStats;
}

export function LandingCommunityRail({
  questions,
  trendingBrags,
  installers,
  stats,
}: LandingCommunityRailProps) {
  const liveQuestion = questions[0];
  const liveBrag = trendingBrags.find((post) => post.media.length > 0);
  const exampleQuestion = LANDING_EXAMPLE_POSTS.find((post) => post.type === "question");
  const exampleBrag = LANDING_EXAMPLE_POSTS.find((post) => post.type === "brag");
  const totalInstalls = installers.reduce((sum, row) => sum + row.bragCount, 0);

  return (
    <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
      <section className="rounded-2xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <h3 className="font-bold">Question on site</h3>
          </div>
          <Link href="/questions" className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
            View all
          </Link>
        </div>
        {liveQuestion ? (
          <PostCard
            post={liveQuestion}
            bragPresentation="compact"
            showInlineComments={false}
          />
        ) : exampleQuestion ? (
          <LandingPostPreview post={exampleQuestion} compact />
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-500" />
            <h3 className="font-bold">Bragged this week</h3>
          </div>
          <Link href="/brags" className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
            Leaderboard
          </Link>
        </div>
        {liveBrag ? (
          <PostCard post={liveBrag} bragPresentation="compact" showInlineComments={false} />
        ) : exampleBrag ? (
          <LandingPostPreview post={exampleBrag} compact />
        ) : null}
      </section>

      <section>
        <div className="mb-3 px-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted" />
              <h3 className="font-bold">Top installers</h3>
            </div>
            <Link href="/discover?tab=leaderboard">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                See board
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted">
            {totalInstalls > 0
              ? `${formatNumber(totalInstalls)} installs shared · ${formatNumber(stats.totalBragPoints)} brag points earned`
              : stats.totalBragPoints > 0
                ? `${formatNumber(stats.totalBragPoints)} brag points earned across the community`
                : "Ranked by brag points on real installation posts"}
          </p>
        </div>
        <InstallerLeaderboardList installers={installers} limit={4} />
      </section>
    </aside>
  );
}

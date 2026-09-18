import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHeroPreview } from "@/components/marketing/landing-hero-preview";
import { LandingFeedWindow } from "@/components/marketing/landing-feed-window";
import { LandingCommunityRail } from "@/components/marketing/landing-community-rail";
import { LandingTrustBar, type LandingCommunityStats } from "@/components/marketing/landing-trust-bar";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { LANDING_PAGE_KEY } from "@/lib/constants";
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

export interface LandingPageProps {
  feedPosts: PostCardData[];
  questions: PostCardData[];
  trendingBrags: PostCardData[];
  installers: InstallerRow[];
  stats: LandingCommunityStats;
}

export function LandingPage({
  feedPosts,
  questions,
  trendingBrags,
  installers,
  stats,
}: LandingPageProps) {
  const heroPosts = [...feedPosts, ...trendingBrags, ...questions];

  return (
    <div className="relative min-h-screen tech-bg">
      <PageViewTracker pageKey={LANDING_PAGE_KEY} />

      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 lg:px-6">
          <Link href="/" className="shrink-0">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link href="/feed" className="hidden sm:block">
              <Button variant="ghost" className="text-muted">
                Explore feed
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="sm:h-10 sm:px-4 sm:text-sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="sm:h-10 sm:px-4 sm:text-sm">
                Join
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -left-24 top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl sm:h-64 sm:w-64" />
        <div className="pointer-events-none absolute -right-24 top-32 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl sm:h-64 sm:w-64" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-6 sm:pb-10 sm:pt-10 lg:px-6 lg:pb-12 lg:pt-12">
          <div className="grid items-center gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="relative z-20 lg:col-start-1 lg:row-start-1">
              <h1 className="text-[2rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Your work is{" "}
                <span className="text-gradient">your reputation.</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                Share the work you do, solve problems, and learn from other installers. Whether
                you&apos;re independent or part of a team, build a reputation for doing things
                right.
              </p>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[17.5rem] sm:max-w-md lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:max-w-none">
              <LandingHeroPreview posts={heroPosts} />
            </div>

            <div className="relative z-20 lg:col-start-1 lg:row-start-2">
              <ul className="space-y-2 text-sm text-foreground/85 sm:text-base">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-cyan-400" />
                  <span>Document quality installs from site — tied to your profile</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-cyan-400" />
                  <span>Ask technical questions to installers who do the same work</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-cyan-400" />
                  <span>Earn brag points when your installs stand out</span>
                </li>
              </ul>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Join InstallBase — It&apos;s Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/feed" className="w-full sm:w-auto">
                  <Button size="lg" variant="ghost" className="w-full border border-border sm:w-auto">
                    Browse the feed
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingTrustBar stats={stats} />

      <section className="relative z-10 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <LandingFeedWindow posts={feedPosts} />
            <LandingCommunityRail
              questions={questions}
              trendingBrags={trendingBrags}
              installers={installers}
              stats={stats}
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-border py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Ready to share your work?
          </h2>
          <p className="mt-3 text-muted">
            Free to join. Post your first install in minutes.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Join InstallBase — It&apos;s Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/feed" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full border border-border sm:w-auto">
                Keep browsing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted lg:px-6">
          <Logo size="sm" className="justify-center" />
          <p className="mt-2">Your work is your reputation.</p>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/landing-page";
import {
  getBragLeaderboard,
  getFeedPosts,
  getPopularQuestions,
  getTrendingBrags,
} from "@/lib/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "InstallBase — Where Installers Share What They Build",
  description:
    "InstallBase is a professional community for installers. Share real installations, solve technical problems, learn from other professionals and build a portfolio of your work.",
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  let feedPosts: Awaited<ReturnType<typeof getFeedPosts>> = [];
  let questions: Awaited<ReturnType<typeof getPopularQuestions>> = [];
  let trendingBrags: Awaited<ReturnType<typeof getTrendingBrags>> = [];
  let installers: Awaited<ReturnType<typeof getBragLeaderboard>> = [];

  try {
    [feedPosts, questions, trendingBrags, installers] = await Promise.all([
      getFeedPosts(undefined, 12),
      getPopularQuestions(4),
      getTrendingBrags(4),
      getBragLeaderboard(5),
    ]);
  } catch {
    feedPosts = [];
    questions = [];
    trendingBrags = [];
    installers = [];
  }

  return (
    <LandingPage
      feedPosts={feedPosts}
      questions={questions}
      trendingBrags={trendingBrags}
      installers={installers}
    />
  );
}

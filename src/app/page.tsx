import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/landing-page";
import { getAppUrl } from "@/lib/app-url";
import {
  getBragLeaderboard,
  getFeedPosts,
  getLandingCommunityStats,
  getPopularQuestions,
  getTrendingBrags,
} from "@/lib/queries";
import { redirect } from "next/navigation";

const title = "InstallBase — Your Work Is Your CV | Installer Portfolio & Community";
const description =
  "Your work is your CV. InstallBase is where technicians and installers build a public portfolio, get faster answers than WhatsApp groups, and earn recognition for real installation work.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "InstallBase",
    url: getAppUrl(),
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "InstallBase" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/icons/icon-512.png"],
  },
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  let feedPosts: Awaited<ReturnType<typeof getFeedPosts>> = [];
  let questions: Awaited<ReturnType<typeof getPopularQuestions>> = [];
  let trendingBrags: Awaited<ReturnType<typeof getTrendingBrags>> = [];
  let installers: Awaited<ReturnType<typeof getBragLeaderboard>> = [];
  let stats: Awaited<ReturnType<typeof getLandingCommunityStats>> = {
    installersSharing: 0,
    installsThisWeek: 0,
    questionsAnswered: 0,
    totalBragPoints: 0,
  };

  try {
    [feedPosts, questions, trendingBrags, installers, stats] = await Promise.all([
      getFeedPosts(undefined, 6),
      getPopularQuestions(2),
      getTrendingBrags(2),
      getBragLeaderboard(4),
      getLandingCommunityStats(),
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
      stats={stats}
    />
  );
}

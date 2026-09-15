import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/landing-page";
import { getFeedPosts } from "@/lib/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "InstallBase — Where Installers Share What They Build",
  description:
    "InstallBase is a professional community for installers. Share real installations, solve technical problems, learn from other professionals and build a portfolio of your work.",
};

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  let showcasePosts: Awaited<ReturnType<typeof getFeedPosts>> = [];
  try {
    const posts = await getFeedPosts(undefined, 6);
    showcasePosts = posts.filter((post) => post.media.length > 0).slice(0, 6);
  } catch {
    showcasePosts = [];
  }

  return <LandingPage showcasePosts={showcasePosts} />;
}

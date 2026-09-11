import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/landing-page";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");
  return <LandingPage />;
}

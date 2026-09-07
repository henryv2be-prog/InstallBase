import { auth } from "@/lib/auth";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const session = await auth();
  if (session?.user?.username) {
    redirect(`/profile/${session.user.username}`);
  }
  if (session?.user) {
    redirect("/settings");
  }
  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <h1 className="mb-4 text-2xl font-bold">Your profile</h1>
      <GuestJoinCard
        title="Create a profile to join the community"
        body="Guests can browse public profiles. Join free to get your own and start posting."
        next="/profile"
      />
    </div>
  );
}

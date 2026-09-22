import { CreatePostCard } from "@/components/feed/create-post";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { MobileAppPage } from "@/components/layout/mobile-app-page";
import { auth } from "@/lib/auth";

export const metadata = { title: "Create" };

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <MobileAppPage className="max-w-lg">
        <h1 className="mb-4 text-2xl font-bold">Create Post</h1>
        <GuestJoinCard
          title="Join to share an install"
          body="Guests can browse the live site. Create a free account to post photos, videos, and questions."
          next="/create"
        />
      </MobileAppPage>
    );
  }

  return (
    <MobileAppPage>
      <h1 className="mb-6 text-2xl font-bold">Create Post</h1>
      <CreatePostCard userName={session.user.name} />
    </MobileAppPage>
  );
}

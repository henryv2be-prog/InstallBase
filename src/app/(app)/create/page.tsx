import { CreatePostCard } from "@/components/feed/create-post";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { CreateFlowViewport } from "@/components/layout/create-flow-viewport";
import { auth } from "@/lib/auth";

export const metadata = { title: "Create" };

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <CreateFlowViewport title="Create Post" className="max-w-lg mx-auto">
        <GuestJoinCard
          title="Join to share an install"
          body="Guests can browse the live site. Create a free account to post photos, videos, and questions."
          next="/create"
        />
      </CreateFlowViewport>
    );
  }

  return (
    <CreateFlowViewport className="mx-auto w-full max-w-3xl">
      <CreatePostCard userName={session.user.name} fitViewport />
    </CreateFlowViewport>
  );
}

import { CreatePostCard } from "@/components/feed/create-post";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { auth } from "@/lib/auth";

export const metadata = { title: "Create" };

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <h1 className="mb-4 text-2xl font-bold">Create Post</h1>
        <GuestJoinCard
          title="Join to share an install"
          body="Guests can browse the live site. Create a free account to post photos, videos, and questions."
          next="/create"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Create Post</h1>
      <CreatePostCard userName={session.user.name} />
    </div>
  );
}

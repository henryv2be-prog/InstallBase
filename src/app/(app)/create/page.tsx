import { CreatePostCard } from "@/components/feed/create-post";
import { auth } from "@/lib/auth";

export const metadata = { title: "Create" };

export default async function CreatePage() {
  const session = await auth();
  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Create Post</h1>
      <CreatePostCard userName={session?.user?.name} />
    </div>
  );
}

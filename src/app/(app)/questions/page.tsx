import { auth } from "@/lib/auth";
import { getPostsByType } from "@/lib/queries";
import { PostFeed } from "@/components/feed/post-card";

export const metadata = { title: "Questions" };

export default async function QuestionsPage() {
  const session = await auth();
  const questions = await getPostsByType("QUESTION", 30);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-2 text-2xl font-bold">❓ Questions</h1>
      <p className="mb-6 text-gray-500">Get help from installers who&apos;ve seen it before</p>
      <PostFeed posts={questions} currentUserId={session?.user?.id} />
    </div>
  );
}

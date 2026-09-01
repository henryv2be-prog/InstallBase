import Link from "next/link";
import { auth } from "@/lib/auth";
import { getConversations, getProfileByUsername, getOrCreateConversation } from "@/lib/queries";
import { PresenceAvatar, PresenceLabel } from "@/components/presence/presence-avatar";
import { RelativeTime } from "@/components/ui/relative-time";
import { notFound, redirect } from "next/navigation";

export const metadata = { title: "Messages" };

interface MessagesPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");
  const { user: username } = await searchParams;

  if (username) {
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();
    if (profile.userId === userId) redirect("/messages");

    const conversation = await getOrCreateConversation(userId, profile.userId);
    redirect(`/messages/${conversation.id}`);
  }

  const conversations = await getConversations(userId);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="text-gray-500">No messages yet</p>
          <p className="mt-2 text-sm text-gray-400">
            Visit an installer&apos;s profile to start a conversation
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(({ conversation }) => {
            const other = conversation.participants.find(
              (p) => p.userId !== userId
            )?.user;
            const lastMessage = conversation.messages[0];

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <PresenceAvatar
                  src={other?.image}
                  name={other?.name}
                  lastSeenAt={other?.lastSeenAt}
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold">{other?.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {lastMessage?.content ?? "No messages yet"}
                  </p>
                  <PresenceLabel lastSeenAt={other?.lastSeenAt} className="text-xs" />
                </div>
                {lastMessage && (
                  <span className="text-xs text-gray-400">
                    <RelativeTime date={lastMessage.createdAt} />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

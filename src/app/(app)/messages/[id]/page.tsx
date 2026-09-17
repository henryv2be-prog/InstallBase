import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markConversationMessagesRead } from "@/lib/notification-read";
import { notFound } from "next/navigation";
import { MessageThread } from "@/components/messages/message-thread";
import { PresenceAvatar, LivePresenceLabel } from "@/components/presence/presence-avatar";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { BackLink } from "@/components/ui/back-link";
import Link from "next/link";

interface MessageThreadPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function MessageThreadPage({ params, searchParams }: MessageThreadPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <h1 className="mb-4 text-2xl font-bold">Messages</h1>
        <GuestJoinCard
          title="Messaging is for members"
          body="Join free to start a conversation with other installers."
          next="/messages"
        />
      </div>
    );
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { include: { profile: true } } } },
      messages: {
        include: { sender: { include: { profile: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const isParticipant = conversation.participants.some((p) => p.userId === userId);
  if (!isParticipant) notFound();

  await markConversationMessagesRead(id, userId);

  const other = conversation.participants.find((p) => p.userId !== userId)?.user;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {from === "activity" && <BackLink href="/activity?tab=messages" label="Back to Activity" />}
      <div className="mb-4 flex items-center gap-3">
        {other ? (
          <Link href={other.profile ? `/profile/${other.profile.username}` : "#"} className="flex min-w-0 items-center gap-3">
            <PresenceAvatar src={other.image} name={other.name} lastSeenAt={other.lastSeenAt} />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">{other.name ?? "Conversation"}</h1>
              <LivePresenceLabel
                userId={other.id}
                initialLastSeenAt={other.lastSeenAt}
                className="text-sm"
              />
            </div>
          </Link>
        ) : (
          <h1 className="text-xl font-bold">Conversation</h1>
        )}
      </div>
      <MessageThread
        conversationId={conversation.id}
        messages={conversation.messages}
        currentUserId={userId}
      />
    </div>
  );
}

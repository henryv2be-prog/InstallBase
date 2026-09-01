import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { MessageThread } from "@/components/messages/message-thread";
import { PresenceAvatar, LivePresenceLabel } from "@/components/presence/presence-avatar";
import Link from "next/link";

interface MessageThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

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

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      read: false,
    },
    data: { read: true },
  });

  const other = conversation.participants.find((p) => p.userId !== userId)?.user;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
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

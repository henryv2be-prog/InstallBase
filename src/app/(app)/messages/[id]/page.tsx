import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MessageThread } from "@/components/messages/message-thread";

interface MessageThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { id } = await params;
  const session = await auth();

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

  const isParticipant = conversation.participants.some(
    (p) => p.userId === session!.user!.id
  );
  if (!isParticipant) notFound();

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: session!.user!.id },
      read: false,
    },
    data: { read: true },
  });

  const other = conversation.participants.find(
    (p) => p.userId !== session!.user!.id
  )?.user;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-4 text-xl font-bold">{other?.name ?? "Conversation"}</h1>
      <MessageThread
        conversationId={conversation.id}
        messages={conversation.messages}
        currentUserId={session!.user!.id}
      />
    </div>
  );
}

"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/lib/actions";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: { name: string | null; image: string | null };
}

export function MessageThread({
  conversationId,
  messages: initialMessages,
  currentUserId,
}: {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!content.trim()) return;
    startTransition(async () => {
      await sendMessage(conversationId, content);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content,
          createdAt: new Date(),
          senderId: currentUserId,
          sender: { name: "You", image: null },
        },
      ]);
      setContent("");
      router.refresh();
    });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.sender.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(msg.sender.name ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isOwn
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-gray-200 p-4 dark:border-gray-800">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} disabled={pending}>
          Send
        </Button>
      </div>
    </div>
  );
}

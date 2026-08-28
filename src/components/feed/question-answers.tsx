"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { addAnswer, markSolution, markHelpful } from "@/lib/actions";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import type { Prisma } from "@/generated/prisma/client";
import { postInclude } from "@/lib/queries";

type PostWithAnswers = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export function QuestionAnswers({
  post,
  currentUserId,
  isAuthor,
}: {
  post: PostWithAnswers;
  currentUserId?: string;
  isAuthor: boolean;
}) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  const handleAnswer = () => {
    if (!content.trim() || !currentUserId) {
      toast.error("Sign in to answer");
      return;
    }
    startTransition(async () => {
      try {
        await addAnswer(post.id, content);
        setContent("");
        toast.success("Answer posted");
      } catch {
        toast.error("Failed to post answer");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 font-bold">{post.answers.length} Answers</h3>

      {currentUserId && (
        <div className="mb-6 flex gap-3">
          <Textarea
            placeholder="Share your solution or advice..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAnswer} disabled={pending} className="self-end">
            Answer
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {post.answers.map((answer) => (
          <div
            key={answer.id}
            className={`rounded-xl border p-4 ${
              answer.isSolution
                ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={answer.author.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(answer.author.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/profile/${answer.author.profile?.username}`}
                    className="text-sm font-semibold hover:text-blue-600"
                  >
                    {answer.author.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{answer.content}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatRelativeTime(answer.createdAt)}
                  </p>
                </div>
              </div>
              {answer.isSolution && <Badge variant="success">✓ Solution</Badge>}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  startTransition(() => {
                    void markHelpful(answer.id);
                  })
                }
              >
                👍 Helpful ({answer.helpful})
              </Button>
              {isAuthor && !post.solved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      await markSolution(answer.id, post.id);
                      toast.success("Marked as solution");
                    })
                  }
                >
                  ✓ Mark Solved
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

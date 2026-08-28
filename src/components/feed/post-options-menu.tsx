"use client";

import Link from "next/link";
import { MoreHorizontal, Link2, Flag, ExternalLink } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { reportContent } from "@/lib/actions";
import { toast } from "sonner";
import { useTransition } from "react";

interface PostOptionsMenuProps {
  postId: string;
  authorId: string;
  currentUserId?: string;
}

const reportReasons = [
  { value: "SPAM", label: "Spam" },
  { value: "OFFENSIVE", label: "Offensive content" },
  { value: "UNSAFE_ADVICE", label: "Unsafe advice" },
  { value: "ADVERTISING", label: "Unwanted advertising" },
  { value: "OTHER", label: "Other" },
] as const;

export function PostOptionsMenu({ postId, authorId, currentUserId }: PostOptionsMenuProps) {
  const [pending, startTransition] = useTransition();

  const copyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied"),
      () => toast.error("Could not copy link")
    );
  };

  const report = (reason: (typeof reportReasons)[number]["value"]) => {
    if (!currentUserId) {
      toast.error("Sign in to report posts");
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("postId", postId);
        formData.append("reportedUserId", authorId);
        formData.append("reason", reason);
        await reportContent(formData);
        toast.success("Report submitted — thanks for helping keep InstallBase safe");
      } catch {
        toast.error("Failed to submit report");
      }
    });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" disabled={pending} aria-label="Post options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/post/${postId}`}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
              View post
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
            onSelect={copyLink}
          >
            <Link2 className="h-4 w-4" />
            Copy link
          </DropdownMenu.Item>
          {currentUserId && currentUserId !== authorId && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 data-[state=open]:bg-slate-100 dark:hover:bg-slate-800 dark:data-[state=open]:bg-slate-800">
                  <Flag className="h-4 w-4" />
                  Report post
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-lg"
                    sideOffset={4}
                  >
                    {reportReasons.map(({ value, label }) => (
                      <DropdownMenu.Item
                        key={value}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
                        onSelect={() => report(value)}
                      >
                        {label}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

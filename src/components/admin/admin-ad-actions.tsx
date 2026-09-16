"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAdActionsProps {
  pending: boolean;
  status: string;
  title: string;
  onPreview: () => void;
  onDuplicate: () => void;
  onActivate: () => void;
  onPause: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function AdminAdActions({
  pending,
  status,
  title,
  onPreview,
  onDuplicate,
  onActivate,
  onPause,
  onArchive,
  onDelete,
}: AdminAdActionsProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="sm" variant="outline" className="w-full sm:w-auto" aria-label="Ad actions">
          <MoreHorizontal className="h-4 w-4" />
          <span className="ml-2 sm:hidden">Actions</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-lg"
          align="end"
          sideOffset={6}
        >
          <DropdownMenu.Item
            className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-foreground/5"
            onSelect={onPreview}
          >
            Preview
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-foreground/5"
            disabled={pending}
            onSelect={onDuplicate}
          >
            Duplicate
          </DropdownMenu.Item>
          {status !== "ACTIVE" && (
            <DropdownMenu.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-foreground/5"
              disabled={pending}
              onSelect={onActivate}
            >
              Activate
            </DropdownMenu.Item>
          )}
          {status === "ACTIVE" && (
            <DropdownMenu.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-foreground/5"
              disabled={pending}
              onSelect={onPause}
            >
              Pause
            </DropdownMenu.Item>
          )}
          {status !== "ARCHIVED" && (
            <DropdownMenu.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none hover:bg-foreground/5"
              disabled={pending}
              onSelect={onArchive}
            >
              Archive
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-500/10 dark:text-red-400"
            disabled={pending}
            onSelect={onDelete}
          >
            Delete “{title.slice(0, 24)}{title.length > 24 ? "…" : ""}”
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

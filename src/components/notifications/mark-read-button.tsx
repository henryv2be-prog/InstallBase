"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function MarkReadButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markNotificationsRead();
          router.refresh();
        })
      }
    >
      Mark all read
    </Button>
  );
}

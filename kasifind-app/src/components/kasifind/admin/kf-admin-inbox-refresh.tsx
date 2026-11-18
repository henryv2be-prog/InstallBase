"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export function KfAdminInboxRefresh({ updatedAtLabel }: { updatedAtLabel: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="kf-admin-inbox-meta">
      <p className="kf-admin-inbox-meta__time">
        Updated {updatedAtLabel}
        {pending ? " · Refreshing…" : null}
      </p>
      <button
        type="button"
        className="kf-btn kf-btn-outline kf-admin-inbox-refresh"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        <RefreshCw className={`h-3.5 w-3.5${pending ? " animate-spin" : ""}`} aria-hidden />
        Refresh
      </button>
    </div>
  );
}
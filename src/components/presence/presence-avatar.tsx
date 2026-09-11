"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { formatLastSeen, isOnline } from "@/lib/presence";

type DotSize = "sm" | "md" | "lg";

const DOT_CLASS: Record<DotSize, string> = {
  sm: "h-2 w-2 border-[1.5px]",
  md: "h-3 w-3 border-2",
  lg: "h-4 w-4 border-[3px]",
};

export function PresenceDot({
  lastSeenAt,
  size = "md",
  className,
}: {
  lastSeenAt?: Date | string | null;
  size?: DotSize;
  className?: string;
}) {
  const [online, setOnline] = useState(() => isOnline(lastSeenAt));

  useEffect(() => {
    const tick = () => setOnline(isOnline(lastSeenAt));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [lastSeenAt]);

  if (!online) return null;

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 z-10 rounded-full border-background bg-emerald-500",
        DOT_CLASS[size],
        className
      )}
      title="Online"
      aria-label="Online"
    />
  );
}

export function PresenceLabel({
  lastSeenAt,
  className,
}: {
  lastSeenAt?: Date | string | null;
  className?: string;
}) {
  const [label, setLabel] = useState(() => formatLastSeen(lastSeenAt));

  useEffect(() => {
    const tick = () => setLabel(formatLastSeen(lastSeenAt));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [lastSeenAt]);

  return (
    <span className={cn(isOnline(lastSeenAt) ? "text-emerald-500" : "text-muted", className)}>
      {label}
    </span>
  );
}

export function PresenceAvatar({
  src,
  name,
  lastSeenAt,
  className,
  fallbackClassName,
  size = "md",
  ringClassName,
  wrapperClassName,
}: {
  src?: string | null;
  name?: string | null;
  lastSeenAt?: Date | string | null;
  className?: string;
  fallbackClassName?: string;
  size?: DotSize;
  ringClassName?: string;
  wrapperClassName?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", wrapperClassName)}>
      <Avatar className={className}>
        <AvatarImage src={src ?? undefined} />
        <AvatarFallback className={fallbackClassName}>{getInitials(name ?? "U")}</AvatarFallback>
      </Avatar>
      <PresenceDot lastSeenAt={lastSeenAt} size={size} className={ringClassName} />
    </span>
  );
}

export function LivePresenceLabel({
  userId,
  initialLastSeenAt,
  className,
}: {
  userId: string;
  initialLastSeenAt?: Date | string | null;
  className?: string;
}) {
  const [lastSeenAt, setLastSeenAt] = useState<Date | string | null>(initialLastSeenAt ?? null);

  useEffect(() => {
    setLastSeenAt(initialLastSeenAt ?? null);
  }, [initialLastSeenAt]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/presence?ids=${encodeURIComponent(userId)}`);
        if (!response.ok) return;
        const data = (await response.json()) as {
          users?: { id: string; lastSeenAt: string | null }[];
        };
        const row = data.users?.find((user) => user.id === userId);
        if (!cancelled && row) setLastSeenAt(row.lastSeenAt);
      } catch {
        /* keep last known value */
      }
    };
    const id = window.setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [userId]);

  return <PresenceLabel lastSeenAt={lastSeenAt} className={className} />;
}

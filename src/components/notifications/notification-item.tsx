"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationRead } from "@/lib/actions";
import { withFromActivity } from "@/lib/navigation";

interface NotificationItemProps {
  id: string;
  href: string;
  read: boolean;
  className: string;
  children: React.ReactNode;
  fromActivity?: boolean;
}

export function NotificationItem({
  id,
  href,
  read,
  className,
  children,
  fromActivity = true,
}: NotificationItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const destination = fromActivity ? withFromActivity(href) : href;

  const handleClick = (e: React.MouseEvent) => {
    if (read || href === "#") return;
    e.preventDefault();
    startTransition(async () => {
      await markNotificationRead(id);
      router.push(destination);
      router.refresh();
    });
  };

  return (
    <Link
      href={destination}
      onClick={handleClick}
      className={`${className}${pending ? " opacity-70" : ""}`}
    >
      {children}
    </Link>
  );
}

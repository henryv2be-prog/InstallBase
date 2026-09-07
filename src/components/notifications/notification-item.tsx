"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationRead } from "@/lib/actions";

interface NotificationItemProps {
  id: string;
  href: string;
  read: boolean;
  className: string;
  children: React.ReactNode;
}

export function NotificationItem({ id, href, read, className, children }: NotificationItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    if (read || href === "#") return;
    e.preventDefault();
    startTransition(async () => {
      await markNotificationRead(id);
      router.push(href);
      router.refresh();
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`${className}${pending ? " opacity-70" : ""}`}
    >
      {children}
    </Link>
  );
}

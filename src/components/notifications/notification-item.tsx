"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const destination = fromActivity ? withFromActivity(href) : href;

  const handleClick = (e: React.MouseEvent) => {
    if (read || href === "#") return;
    e.preventDefault();
    router.push(destination);
    void markNotificationRead(id);
  };

  return (
    <Link
      href={destination}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  );
}

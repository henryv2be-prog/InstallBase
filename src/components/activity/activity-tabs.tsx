"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "notifications", label: "Notifications", href: "/activity?tab=notifications" },
  { id: "messages", label: "Messages", href: "/activity?tab=messages" },
];

export function ActivityTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "messages" ? "messages" : "notifications";

  return (
    <div className="mb-6 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      {tabs.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-colors",
            tab === item.id
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

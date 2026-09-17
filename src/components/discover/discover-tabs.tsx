"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "trending", label: "Trending" },
  { id: "questions", label: "Questions" },
  { id: "projects", label: "Projects" },
  { id: "people", label: "People" },
  { id: "products", label: "Products" },
  { id: "leaderboard", label: "Leaderboard" },
];

export function DiscoverTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "trending";

  return (
    <div className="mb-6 -mx-1 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={item.id === "trending" ? "/discover" : `/discover?tab=${item.id}`}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === item.id
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

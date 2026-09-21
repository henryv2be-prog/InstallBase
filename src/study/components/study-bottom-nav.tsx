"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/study/dashboard", label: "Home", icon: "⌂" },
  { href: "/study/subjects", label: "Subjects", icon: "◫" },
  { href: "/study/practice", label: "Practice", icon: "▶" },
  { href: "/study/progress", label: "Progress", icon: "↗" },
  { href: "/study/profile", label: "You", icon: "☺" },
] as const;

export function StudyBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="study-tab-bar"
      aria-label="Study Coach navigation"
    >
      <ul className="study-tab-bar__list">
        {TABS.map((tab) => {
          const active =
            tab.href === "/study/dashboard"
              ? pathname === "/study/dashboard" || pathname === "/study"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`study-tab-bar__link ${active ? "study-tab-bar__link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="study-tab-bar__icon" aria-hidden>
                  {tab.icon}
                </span>
                <span className="study-tab-bar__label">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

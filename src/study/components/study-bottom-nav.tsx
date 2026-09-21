"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudyT } from "@/study/components/study-locale-provider";

export function StudyBottomNav() {
  const pathname = usePathname();
  const t = useStudyT();
  const TABS = [
    { href: "/study/dashboard", label: t.nav.home, icon: "⌂" },
    { href: "/study/subjects", label: t.nav.subjects, icon: "◫" },
    { href: "/study/practice", label: t.nav.practice, icon: "▶" },
    { href: "/study/progress", label: t.nav.progress, icon: "↗" },
    { href: "/study/profile", label: t.nav.profile, icon: "☺" },
  ] as const;

  return (
    <nav
      className="study-tab-bar"
      aria-label={t.nav.aria}
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

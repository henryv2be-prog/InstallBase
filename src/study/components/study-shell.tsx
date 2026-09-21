import Link from "next/link";
import type { ReactNode } from "react";
import { StudyBottomNav } from "@/study/components/study-bottom-nav";

type Props = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  /** Main tab screens show bottom nav; immersive flows (quiz, onboarding) hide it. */
  showNav?: boolean;
  /** Full-bleed layout without side padding (quiz). */
  immersive?: boolean;
  headerExtra?: ReactNode;
};

export function StudyShell({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
  showNav = false,
  immersive = false,
  headerExtra,
}: Props) {
  return (
    <div
      className={`study-shell ${immersive ? "study-shell--immersive" : ""} ${showNav ? "study-shell--with-nav" : ""}`}
    >
      <div className="study-shell__inner">
        <header className="study-shell__header">
          {backHref ? (
            <Link href={backHref} className="study-back study-touch-target">
              ← {backLabel ?? "Back"}
            </Link>
          ) : showNav ? (
            <div className="study-brand" aria-hidden>
              <span className="study-brand__mark">12</span>
              <span className="study-brand__text">Study Coach</span>
            </div>
          ) : (
            <div className="study-brand" aria-hidden>
              <span className="study-brand__mark">12</span>
            </div>
          )}
          {(title || subtitle || headerExtra) && !showNav ? (
            <div className="study-shell__titles">
              {title ? <h1 className="study-shell__title">{title}</h1> : null}
              {subtitle ? <p className="study-shell__subtitle">{subtitle}</p> : null}
              {headerExtra}
            </div>
          ) : null}
        </header>
        <main className="study-shell__main">{children}</main>
      </div>
      {showNav ? <StudyBottomNav /> : null}
    </div>
  );
}

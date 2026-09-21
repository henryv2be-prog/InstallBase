import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyShell } from "@/study/components/study-shell";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";

export const dynamic = "force-dynamic";

export default async function StudyCoachHomePage() {
  const learner = await getStudyLearnerForRequest();
  if (isLearnerOnboarded(learner)) {
    redirect("/study/dashboard");
  }

  return (
    <StudyShell>
      <section className="study-hero mb-6">
        <span className="study-pill study-pill--prototype">Grade 12 · NSC · 2026</span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
          Know what to study next.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--study-muted)]">
          A study coach built for South African matrics — exams, targets, and topic mastery in one
          place. This is <strong className="font-semibold text-[var(--study-text)]">not</strong>{" "}
          InstallBase.
        </p>
      </section>

      <section className="study-card mb-6 space-y-3 p-5">
        <h2 className="text-lg font-semibold">You&apos;ll set up in about 2 minutes</h2>
        <ul className="space-y-2 text-sm text-[var(--study-muted)]">
          <li>✓ Your name &amp; Grade 12 profile</li>
          <li>✓ Subjects with current &amp; target marks</li>
          <li>✓ Exam dates (days remaining)</li>
        </ul>
      </section>

      <div className="mt-auto space-y-3">
        <Link href="/study/onboarding" className="study-btn study-btn-primary study-touch-target block w-full text-center">
          Get started
        </Link>
        <p className="text-center text-xs text-[var(--study-muted)]">
          Open this app at <strong className="text-[var(--study-text)]">/study</strong> — not the
          InstallBase feed.
        </p>
        <Link
          href="/feed"
          className="study-btn study-btn-ghost study-touch-target block w-full text-center text-sm"
        >
          Go to InstallBase instead
        </Link>
      </div>
    </StudyShell>
  );
}

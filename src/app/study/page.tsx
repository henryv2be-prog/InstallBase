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
      <section className="mb-8 pt-4">
        <span className="study-pill study-pill--prototype">Matric · NSC · CAPS</span>
        <h1 className="study-display mt-5">
          Don&apos;t worry.
          <br />
          We&apos;ve got a plan.
        </h1>
        <p className="study-lead mt-4">
          Grade 12 Study Coach tells you what to work on next — not another admin dashboard.
        </p>
      </section>

      <section className="study-panel p-5 mb-8 space-y-3">
        <p className="font-bold text-lg">About 2 minutes</p>
        <ul className="space-y-2 text-sm text-[var(--study-muted)]">
          <li>✓ Your name &amp; subjects</li>
          <li>✓ Current &amp; target marks</li>
          <li>✓ NSC exam dates</li>
        </ul>
      </section>

      <div className="mt-auto space-y-3">
        <Link
          href="/study/onboarding"
          className="study-btn study-btn-primary study-touch-target block w-full text-center"
        >
          Build my study plan
        </Link>
        <p className="text-center text-xs text-[var(--study-muted)]">
          Free · works on your phone · no sign-in required
        </p>
      </div>
    </StudyShell>
  );
}

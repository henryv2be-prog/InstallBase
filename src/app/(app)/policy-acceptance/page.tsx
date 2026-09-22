import { Suspense } from "react";
import { PolicyAcceptanceForm } from "@/components/legal/policy-acceptance-form";

export const metadata = { title: "Accept policies" };
export const dynamic = "force-dynamic";

export default function PolicyAcceptancePage() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-1 py-6">
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <PolicyAcceptanceForm />
      </Suspense>
    </div>
  );
}

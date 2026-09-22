"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isPolicyExemptPath } from "@/lib/legal/exempt-paths";

export function PolicyGate({
  compliant,
  children,
}: {
  compliant: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (compliant) return;
    if (isPolicyExemptPath(pathname)) return;
    const next = encodeURIComponent(pathname);
    router.replace(`/policy-acceptance?next=${next}`);
  }, [compliant, pathname, router]);

  if (!compliant && !isPolicyExemptPath(pathname)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-center text-muted">
        <p className="text-sm">Loading policy acceptance…</p>
      </div>
    );
  }

  return <>{children}</>;
}

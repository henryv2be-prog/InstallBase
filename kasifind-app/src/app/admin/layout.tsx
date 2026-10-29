import Link from "next/link";
import { requireAdminPage } from "@/lib/kasifind/admin-guard";
import { KfAdminNav } from "@/components/kasifind/kf-admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="kf-admin-root">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[var(--kf-forest)] sm:text-2xl">KasiFind Admin Portal</h1>
          <p className="text-sm text-[var(--kf-muted)]">Monitor growth, listings, and community activity.</p>
        </div>
        <Link href="/" className="kf-btn kf-btn-outline text-sm">
          View public site
        </Link>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-56 lg:shrink-0">
          <KfAdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

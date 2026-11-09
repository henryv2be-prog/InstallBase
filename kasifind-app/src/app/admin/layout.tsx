import Link from "next/link";
import { requireAdminPage } from "@/lib/kasifind/admin-guard";
import { KfAdminNav } from "@/components/kasifind/kf-admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="kf-admin-root">
      <header className="kf-admin-hero kf-admin-hero--compact-mobile mb-4 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
        <div>
          <p className="kf-admin-hero-kicker">Admin portal</p>
          <h1 className="kf-admin-hero-title">KasiFind dashboard</h1>
          <p className="kf-admin-hero-sub hidden sm:block">
            Monitor growth, listings, and community activity.
          </p>
        </div>
        <Link href="/" className="kf-btn kf-btn-outline text-sm shrink-0">
          View public site
        </Link>
      </header>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden w-56 shrink-0 lg:block">
          <KfAdminNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

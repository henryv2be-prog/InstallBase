import { requireAdminPage } from "@/lib/kasifind/admin-guard";
import { KfAdminShell } from "@/components/kasifind/admin/kf-admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return <KfAdminShell>{children}</KfAdminShell>;
}
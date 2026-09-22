import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActivePolicyVersions } from "@/lib/legal/compliance";
import { AdminPoliciesPanel } from "@/components/admin/admin-policies-panel";

export const metadata = { title: "Policies · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPoliciesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/feed");

  const activePolicies = await getActivePolicyVersions();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Policies & consent</h1>
        <p className="text-muted">Active legal versions and user acceptance status.</p>
      </div>
      <AdminPoliciesPanel activePolicies={activePolicies} />
    </div>
  );
}

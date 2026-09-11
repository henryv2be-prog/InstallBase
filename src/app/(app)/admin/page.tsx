import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminData } from "@/lib/queries";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/feed");

  const data = await getAdminData();
  return <AdminDashboard data={data} />;
}

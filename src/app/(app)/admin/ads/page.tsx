import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdAdminOverview, getAdAdminList } from "@/lib/advertising/queries";
import { AdminAdsDashboard } from "@/components/admin/admin-ads-dashboard";

export const metadata = { title: "Admin — Advertising" };

export default async function AdminAdsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/feed");

  const [overview, list] = await Promise.all([getAdAdminOverview(), getAdAdminList()]);

  return <AdminAdsDashboard overview={overview} list={list} />;
}

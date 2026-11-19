import type { Metadata } from "next";
import { KF_PRIVATE_ROUTE_ROBOTS } from "@/lib/kasifind/seo-private-metadata";

export const metadata: Metadata = {
  robots: KF_PRIVATE_ROUTE_ROBOTS,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
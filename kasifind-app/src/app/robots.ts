import type { MetadataRoute } from "next";
import { buildKasiFindRobots } from "@/lib/kasifind/seo-robots";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return buildKasiFindRobots();
}
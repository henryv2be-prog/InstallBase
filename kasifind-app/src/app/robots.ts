import type { MetadataRoute } from "next";
import { buildKasiFindRobots } from "@/lib/kasifind/seo-robots";

export default function robots(): MetadataRoute.Robots {
  return buildKasiFindRobots();
}
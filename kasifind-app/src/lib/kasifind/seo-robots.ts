import "server-only";
import type { MetadataRoute } from "next";
import {
  buildKasiFindRobotsDirectives,
  type RobotsDirectives,
} from "@/lib/kasifind/seo-robots-core";
import { getConfiguredSiteOrigin } from "@/lib/kasifind/site-config";

export type { RobotsDirectives } from "@/lib/kasifind/seo-robots-core";
export { buildKasiFindRobotsDirectives, formatRobotsForTest } from "@/lib/kasifind/seo-robots-core";

export function buildKasiFindRobots(): MetadataRoute.Robots {
  const origin = getConfiguredSiteOrigin();
  const { rules, sitemap, host } = buildKasiFindRobotsDirectives(origin);
  return { rules, sitemap, host };
}
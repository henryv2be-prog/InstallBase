import "server-only";
import type { MetadataRoute } from "next";
import {
  buildKasiFindRobotsDirectives,
  type RobotsDirectives,
} from "@/lib/kasifind/seo-robots-core";
import { resolvePublicSiteOrigin } from "@/lib/kasifind/site-config";
import { headers } from "next/headers";

export type { RobotsDirectives } from "@/lib/kasifind/seo-robots-core";
export { buildKasiFindRobotsDirectives, formatRobotsForTest } from "@/lib/kasifind/seo-robots-core";

export async function buildKasiFindRobots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const origin = resolvePublicSiteOrigin(headerStore);
  const { rules, sitemap, host } = buildKasiFindRobotsDirectives(origin);
  return { rules, sitemap, host };
}
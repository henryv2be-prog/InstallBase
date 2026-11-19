import type { MetadataRoute } from "next";

export type RobotsDirectives = {
  rules: NonNullable<MetadataRoute.Robots["rules"]>;
  sitemap: string | string[] | undefined;
  host: string | undefined;
};

export function buildKasiFindRobotsDirectives(origin: string | null): RobotsDirectives {
  const disallow = ["/admin", "/account", "/login", "/register", "/api/"];
  const rules: NonNullable<MetadataRoute.Robots["rules"]> = [
    {
      userAgent: "*",
      allow: "/",
      disallow,
    },
  ];

  const base = origin?.replace(/\/$/, "");
  const sitemap = base ? `${base}/sitemap.xml` : undefined;
  const host = base ? new URL(base).host : undefined;

  return { rules, sitemap, host };
}

/** Serializes robots rules for snapshot tests. */
export function formatRobotsForTest(directives: RobotsDirectives): string {
  const lines: string[] = [];
  const rulesList = Array.isArray(directives.rules) ? directives.rules : [directives.rules];
  for (const rule of rulesList) {
    if (!rule) continue;
    const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent ?? "*"];
    for (const ua of agents) {
      lines.push(`User-agent: ${ua}`);
      for (const path of rule.allow ?? []) {
        if (path) lines.push(`Allow: ${path}`);
      }
      for (const path of rule.disallow ?? []) {
        if (path) lines.push(`Disallow: ${path}`);
      }
    }
  }
  if (directives.sitemap) {
    const maps = Array.isArray(directives.sitemap) ? directives.sitemap : [directives.sitemap];
    for (const map of maps) lines.push(`Sitemap: ${map}`);
  }
  if (directives.host) lines.push(`Host: ${directives.host}`);
  return `${lines.join("\n")}\n`;
}
import type { MetadataRoute } from "next";
import { iconUrl } from "@/lib/icon-version";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "InstallBase",
    short_name: "InstallBase",
    description: "Where installers share what they build.",
    start_url: "/feed",
    scope: "/",
    display: "standalone",
    prefer_related_applications: false,
    orientation: "portrait",
    background_color: "#050810",
    theme_color: "#050810",
    categories: ["social", "productivity"],
    icons: [
      {
        src: iconUrl("icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: iconUrl("icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: iconUrl("icon-192-maskable.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: iconUrl("icon-512-maskable.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import type { MetadataRoute } from "next";
import { iconUrl } from "@/lib/icon-version";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/study",
    name: "Grade 12 Study Coach",
    short_name: "Study Coach",
    description: "Know what to study next for your Grade 12 NSC exams.",
    start_url: "/study",
    scope: "/",
    display: "standalone",
    prefer_related_applications: false,
    orientation: "portrait",
    background_color: "#0c1222",
    theme_color: "#0c1222",
    categories: ["education"],
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

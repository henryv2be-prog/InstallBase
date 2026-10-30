import type { MetadataRoute } from "next";
import { KF_APP_ICON_COLORS } from "@/lib/kasifind/brand-app-icon";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "KasiFind",
    short_name: "KasiFind",
    description: "Find local. Support local. Discover trusted services near you.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: KF_APP_ICON_COLORS.ivory,
    theme_color: KF_APP_ICON_COLORS.forest,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

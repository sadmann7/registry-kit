import type { MetadataRoute } from "next";

import { siteConfig, siteTitle } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteTitle} registry`,
    short_name: siteTitle,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    // Matches --background in light mode, like the default theme-color.
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

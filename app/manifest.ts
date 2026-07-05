import type { MetadataRoute } from "next"

import {
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  THEME_COLOR,
  THEME_BACKGROUND,
} from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME_SHORT,
    description: SITE_DESCRIPTION,
    lang: SITE_LOCALE,
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: THEME_BACKGROUND,
    theme_color: THEME_COLOR,
    orientation: "portrait",
    categories: ["education", "books", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
        purpose: "maskable",
      },
    ],
  }
}

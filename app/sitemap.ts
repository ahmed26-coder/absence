import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  // Only genuinely public pages belong in the sitemap; admin and student
  // areas require auth and would resolve to login redirects for crawlers.
  return [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/faq`, lastModified: new Date() },
    { url: `${SITE_URL}/our-sheikh`, lastModified: new Date() },
  ]
}

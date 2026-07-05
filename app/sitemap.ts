import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

// Same URL is served in Arabic and English (RTL Arabic UI); advertise the
// language alternates so search engines surface it in both markets.
const languages = {
  "ar-EG": SITE_URL,
  ar: SITE_URL,
  en: SITE_URL,
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  // Only genuinely public pages belong in the sitemap; admin and student
  // areas require auth and would resolve to login redirects for crawlers.
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/our-sheikh`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages },
    },
  ]
}

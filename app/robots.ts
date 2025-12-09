import type { MetadataRoute } from "next"

const BASE_URL = "https://ta2seel.example.com" // TODO: replace with real domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}

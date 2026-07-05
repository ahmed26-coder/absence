/**
 * Canonical site origin used for metadata, canonical URLs, robots, and the
 * sitemap. Set NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL) in the
 * environment; the fallback is only used in local development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "")

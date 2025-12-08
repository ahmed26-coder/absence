import type { MetadataRoute } from "next"

import { getCoursesFromSupabase } from "@/lib/supabase-storage"

const BASE_URL = "https://ta2seel.example.com" // TODO: replace with real domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date() },
    { url: `${BASE_URL}/courses`, lastModified: new Date() },
    { url: `${BASE_URL}/students`, lastModified: new Date() },
    { url: `${BASE_URL}/analytics`, lastModified: new Date() },
  ]

  try {
    const courses = await getCoursesFromSupabase()
    courses.forEach((course) => {
      routes.push({ url: `${BASE_URL}/courses/${course.id}`, lastModified: new Date() })
    })
  } catch (error) {
    console.warn("[seo] Failed to expand courses in sitemap", error)
  }

  return routes
}

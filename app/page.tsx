import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getCoursesFromSupabase } from "@/lib/supabase-storage"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site"
import {
  organizationJsonLd,
  websiteJsonLd,
  breadcrumbJsonLd,
  coursesItemListJsonLd,
  jsonLdScript,
} from "@/lib/seo"
import { LandingContent } from "./landing-client"

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | تعلّم العلوم الشرعية أونلاين — مصر والعالم`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    type: "website",
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  const allCourses = await getCoursesFromSupabase(supabase)
  const featuredCourses = allCourses.slice(0, 3)

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      websiteJsonLd(),
      breadcrumbJsonLd([{ name: "الرئيسية", path: "/" }]),
      ...(featuredCourses.length ? [coursesItemListJsonLd(featuredCourses)] : []),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }}
        suppressHydrationWarning
      />
      <LandingContent featuredCourses={featuredCourses} user={user} />
    </>
  )
}

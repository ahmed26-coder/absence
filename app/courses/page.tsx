import type { Metadata } from "next"

import CoursesPageClient from "./client-page"

export const metadata: Metadata = {
  title: "الدورات – نظام متابعة الحضور",
  description: "إدارة الدورات الشرعية، تسجيل حضور الجلسات، وإحصائيات لكل دورة.",
  alternates: { canonical: "/courses" },
}

export default function CoursesPage() {
  return <CoursesPageClient />
}

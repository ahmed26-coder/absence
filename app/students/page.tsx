import type { Metadata } from "next"

import StudentsPageClient from "./client-page"

export const metadata: Metadata = {
  title: "الطلاب – نظام متابعة الحضور",
  description: "إدارة بيانات الطلاب، ربطهم بالدورات، وتسجيل حضورهم اليومي.",
  alternates: { canonical: "/students" },
}

export default function StudentsPage() {
  return <StudentsPageClient />
}

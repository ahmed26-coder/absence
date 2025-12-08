import type { Metadata } from "next"

import AnalyticsPageClient from "./client-page"

export const metadata: Metadata = {
  title: "الإحصائيات – نظام متابعة الحضور",
  description: "لوحة إحصائيات للدورات والطلاب ومتوسط الحضور.",
  alternates: { canonical: "/analytics" },
}

export default function AnalyticsPage() {
  return <AnalyticsPageClient />
}

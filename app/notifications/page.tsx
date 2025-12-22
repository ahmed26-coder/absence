import type { Metadata } from "next"
import NotificationsPageClient from "./notifications-page-client"

export const metadata: Metadata = {
    title: "إدارة التنبيهات – نظام متابعة الحضور",
    description: "إرسال التنبيهات للطلاب عبر قنوات التواصل المختلفة.",
    alternates: { canonical: "/students/notifications" },
}

export default function NotificationsPage() {
    return <NotificationsPageClient />
}

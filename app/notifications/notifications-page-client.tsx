"use client"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { NotificationSender } from "@/components/notification-sender"
import { Bell, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const NotificationsContent = () => {
    const { data, courses } = useAttendance()

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/students" aria-label="العودة إلى قائمة الطلاب">
                            <ArrowRight size={20} aria-hidden="true" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-foreground">إدارة التنبيهات</h1>
                        <p className="text-muted-foreground mt-1">أرسل تنبيهات مخصصة للطلاب عبر قنوات مختلفة.</p>
                    </div>
                </div>
                <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl flex items-center gap-3 border border-blue-100">
                    <Bell className="animate-pulse" />
                    <span className="text-sm font-bold">نظام التنبيهات الذكي</span>
                </div>
            </div>

            <NotificationSender students={data.students} courses={courses} />
        </div>
    )
}

export default function NotificationsPageClient() {
    return (
        <AttendanceProvider>
            <NotificationsContent />
        </AttendanceProvider>
    )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NotificationsClient from "./notifications-client"
import { getStudentNotifications } from "@/lib/notifications"

export const metadata = {
    title: "التنبيهات | اكاديمية تأصيل",
}

export default async function StudentNotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch student notifications
    const notifications = await getStudentNotifications(user.id, supabase)

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <NotificationsClient studentId={user.id} initialNotifications={notifications} />
        </div>
    )
}

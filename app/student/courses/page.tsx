import { createClient } from "@/lib/supabase/server"
import { getCoursesFromSupabase, getEnrollmentsForStudent } from "@/lib/supabase-storage"
import StudentCoursesClient from "./courses-client"
import { redirect } from "next/navigation"
import { AttendanceProvider } from "@/components/attendance-context"

export default async function StudentCoursesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const [allCourses, enrolledIds] = await Promise.all([
        getCoursesFromSupabase(supabase),
        getEnrollmentsForStudent(user.id, supabase),
    ])

    return (
        <AttendanceProvider>
            <StudentCoursesClient
                initialAllCourses={allCourses}
                initialEnrolledIds={enrolledIds}
                studentId={user.id}
            />
        </AttendanceProvider>
    )
}

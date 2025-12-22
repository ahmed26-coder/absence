import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StudentCourseDetailClient from "./course-detail-client"
import { getCoursesFromSupabase } from "@/lib/supabase-storage"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function StudentCourseDetailPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Parallel data fetching
    const [courses] = await Promise.all([
        getCoursesFromSupabase(supabase),
    ])

    const course = courses.find(c => c.id === id)

    if (!course) {
        return <div className="p-8 text-center">Course not found</div>
    }

    // Verify enrollment
    const { data: enrollment } = await supabase
        .from("student_courses")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", id)
        .single()

    const isEnrolled = !!enrollment

    // Fetch attendance for this specific course
    const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", user.id)
        .eq("course_id", id)

    return (
        <StudentCourseDetailClient
            course={course}
            studentId={user.id}
            isEnrolled={isEnrolled}
            initialAttendance={attendanceData || []}
        />
    )
}

import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getUserRole } from "@/app/auth/actions"
import StudentProfileClient from "./client-page"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function StudentProfilePage({ params }: PageProps) {
    const resolvedParams = await params
    const supabase = await createClient()

    // Check if user is admin
    const role = await getUserRole()
    if (role !== "admin") {
        redirect("/")
    }

    // Fetch student data from students table
    const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

    if (studentError || !student) {
        notFound()
    }

    // Fetch student's enrolled courses
    const { data: enrollments } = await supabase
        .from("student_courses")
        .select("course_id, courses(id, name)")
        .eq("student_id", resolvedParams.id)

    const courseIds = enrollments?.map((e: any) => e.course_id) || []

    // Fetch attendance records for this student
    const { data: attendanceRecords } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", resolvedParams.id)
        .order("date", { ascending: false })

    // Fetch courses data
    const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds.length > 0 ? courseIds : [""])

    return (
        <StudentProfileClient
            student={student}
            courses={courses || []}
            attendanceRecords={attendanceRecords || []}
        />
    )
}

import { supabase } from "./supabase"
import type { AttendanceData, Student, AttendanceStatus, Course } from "./types"

export const getStudentsFromSupabase = async (): Promise<Student[]> => {
  try {
    const { data, error } = await supabase.from("students").select("*")

    if (error) {
      console.error("[v0] Error fetching students:", error)
      return []
    }

    // Fetch attendance records and course assignments for each student
    const studentsWithExtras: Student[] = await Promise.all(
      (data || []).map(async (student) => {
        const [{ data: attendanceData, error: attendanceError }, { data: courseRows, error: courseError }] =
          await Promise.all([
            supabase.from("attendance").select("*").eq("student_id", student.id),
            supabase.from("student_courses").select("course_id").eq("student_id", student.id),
          ])

        if (attendanceError) {
          console.error("[v0] Error fetching attendance:", attendanceError)
        }
        if (courseError) {
          console.error("[v0] Error fetching student_courses:", courseError)
        }

        const attendance: Record<string, { status: AttendanceStatus; reason?: string }> = {}
        ;(attendanceData || []).forEach((record) => {
          const status = record.status === "present" ? "H" : record.status === "absent" ? "G" : "E"
          attendance[record.date] = {
            status: status as AttendanceStatus,
            reason: record.reason || undefined,
          }
        })

        return {
          ...student,
          attendance,
          courses: (courseRows || []).map((row) => row.course_id),
        }
      }),
    )

    return studentsWithExtras
  } catch (error) {
    console.error("[v0] Unexpected error fetching students:", error)
    return []
  }
}

export const addStudentToSupabase = async (
  payload: Pick<Student, "name"> & Partial<Student> & { courses: string[] },
): Promise<Student | null> => {
  try {
    const { name, courses, ...rest } = payload
    const { data, error } = await supabase
      .from("students")
      .insert([{ name, ...rest }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding student:", error)
      return null
    }

    // attach courses
    if (courses && courses.length) {
      const { error: courseError } = await supabase
        .from("student_courses")
        .insert(courses.map((courseId) => ({ student_id: data.id, course_id: courseId })))
      if (courseError) {
        console.error("[v0] Error adding student courses:", courseError)
      }
    }

    return { ...data, attendance: {}, courses }
  } catch (error) {
    console.error("[v0] Unexpected error adding student:", error)
    return null
  }
}

export const deleteStudentFromSupabase = async (studentId: string): Promise<boolean> => {
  try {
    // Delete attendance records first
    const { error: attendanceError } = await supabase.from("attendance").delete().eq("student_id", studentId)

    if (attendanceError) {
      console.error("[v0] Error deleting attendance records:", attendanceError)
      return false
    }

    // Delete student-course relations
    const { error: scError } = await supabase.from("student_courses").delete().eq("student_id", studentId)
    if (scError) {
      console.error("[v0] Error deleting student_courses:", scError)
    }

    // Delete student
    const { error: studentError } = await supabase.from("students").delete().eq("id", studentId)

    if (studentError) {
      console.error("[v0] Error deleting student:", studentError)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Unexpected error deleting student:", error)
    return false
  }
}

export const updateStudentInSupabase = async (
  studentId: string,
  updates: Partial<Omit<Student, "id" | "attendance">> & { courses?: string[] },
): Promise<boolean> => {
  try {
    const { courses, ...rest } = updates
    const { error } = await supabase.from("students").update(rest).eq("id", studentId)

    if (error) {
      console.error("[v0] Error updating student:", error)
      return false
    }

    if (courses) {
      const { error: delError } = await supabase.from("student_courses").delete().eq("student_id", studentId)
      if (delError) {
        console.error("[v0] Error clearing student courses:", delError)
      }
      if (courses.length) {
        const { error: addError } = await supabase
          .from("student_courses")
          .insert(courses.map((courseId) => ({ student_id: studentId, course_id: courseId })))
        if (addError) {
          console.error("[v0] Error updating student courses:", addError)
        }
      }
    }

    return true
  } catch (error) {
    console.error("[v0] Unexpected error updating student:", error)
    return false
  }
}

export const updateAttendanceInSupabase = async (
  studentId: string,
  date: string,
  status: AttendanceStatus,
  reason?: string,
): Promise<boolean> => {
  try {
    if (status === null) {
      // Delete attendance record
      const { error } = await supabase.from("attendance").delete().eq("student_id", studentId).eq("date", date)

      if (error) {
        console.error("[v0] Error deleting attendance:", error)
        return false
      }
    } else {
      // Convert status format
      const dbStatus = status === "H" ? "present" : status === "G" ? "absent" : "excused"

      // Upsert attendance record
      const { error } = await supabase.from("attendance").upsert(
        [
          {
            student_id: studentId,
            date,
            status: dbStatus,
            reason: reason || null,
          },
        ],
        { onConflict: "student_id,date" },
      )

      if (error) {
        console.error("[v0] Error updating attendance:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("[v0] Unexpected error updating attendance:", error)
    return false
  }
}

export const getCoursesFromSupabase = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase.from("courses").select("*")
    if (error) {
      console.error("[v0] Error fetching courses:", error)
      return []
    }
    return data || []
  } catch (error) {
    console.error("[v0] Unexpected error fetching courses:", error)
    return []
  }
}

export const addCourseToSupabase = async (course: Course): Promise<Course | null> => {
  try {
    const { data, error } = await supabase.from("courses").insert([course]).select().single()
    if (error) {
      console.error("[v0] Error adding course:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("[v0] Unexpected error adding course:", error)
    return null
  }
}

export const updateCourseInSupabase = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  try {
    const { error } = await supabase.from("courses").update(updates).eq("id", courseId)
    if (error) {
      console.error("[v0] Error updating course:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("[v0] Unexpected error updating course:", error)
    return false
  }
}

export const deleteCourseFromSupabase = async (courseId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("courses").delete().eq("id", courseId)
    if (error) {
      console.error("[v0] Error deleting course:", error)
      return false
    }
    // TODO: ensure cascading delete on student_courses/attendance or handle here.
    return true
  } catch (error) {
    console.error("[v0] Unexpected error deleting course:", error)
    return false
  }
}

export const getStorageData = async (): Promise<AttendanceData> => {
  const [students, courses] = await Promise.all([getStudentsFromSupabase(), getCoursesFromSupabase()])
  return {
    students,
    courses,
    lastUpdated: new Date().toISOString(),
  }
}

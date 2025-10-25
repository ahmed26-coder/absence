import { supabase } from "./supabase"
import type { AttendanceData, Student, AttendanceStatus } from "./types"

export const getStudentsFromSupabase = async (): Promise<Student[]> => {
  try {
    const { data, error } = await supabase.from("students").select("*")

    if (error) {
      console.error("[v0] Error fetching students:", error)
      return []
    }

    // Fetch attendance records for each student
    const studentsWithAttendance: Student[] = await Promise.all(
      (data || []).map(async (student) => {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", student.id)

        if (attendanceError) {
          console.error("[v0] Error fetching attendance:", attendanceError)
          return { ...student, attendance: {} }
        }

        const attendance: Record<string, { status: AttendanceStatus; reason?: string }> = {}
        ;(attendanceData || []).forEach((record) => {
          const status = record.status === "present" ? "H" : record.status === "absent" ? "G" : "E"
          attendance[record.date] = {
            status: status as AttendanceStatus,
            reason: record.reason || undefined,
          }
        })

        return { ...student, attendance }
      }),
    )

    return studentsWithAttendance
  } catch (error) {
    console.error("[v0] Unexpected error fetching students:", error)
    return []
  }
}

export const addStudentToSupabase = async (name: string): Promise<Student | null> => {
  try {
    const { data, error } = await supabase.from("students").insert([{ name }]).select().single()

    if (error) {
      console.error("[v0] Error adding student:", error)
      return null
    }

    return { ...data, attendance: {} }
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

export const updateStudentInSupabase = async (studentId: string, name: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("students").update({ name }).eq("id", studentId)

    if (error) {
      console.error("[v0] Error updating student:", error)
      return false
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

export const getStorageData = async (): Promise<AttendanceData> => {
  const students = await getStudentsFromSupabase()
  return {
    students,
    lastUpdated: new Date().toISOString(),
  }
}
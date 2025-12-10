import { getSupabaseClient } from "./supabase"
import { getStorageData as getLocalAttendanceData } from "./storage"
import { getStoredCourses } from "./course-storage"
import type { AttendanceData, AttendanceRecord, AttendanceStatus, Course, Student } from "./types"

export const getStudentsFromSupabase = async (): Promise<Student[]> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase.from("students").select("*")

    if (error) {
      console.error("[v0] Error fetching students:", error)
      return []
    }

    // Fetch attendance records and course assignments for each student
    const studentsWithExtras: Student[] = await Promise.all(
      (data || []).map(async (student) => {
        const studentId = String(student.id)
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

        // attendance is now grouped by course
        const attendance: Record<string, Record<string, AttendanceRecord>> = {}
        ;(attendanceData || []).forEach((record) => {
          const status = record.status === "present" ? "H" : record.status === "absent" ? "G" : "E"
          const courseKey = record.course_id ? String(record.course_id) : "_global"
          attendance[courseKey] = attendance[courseKey] || {}
          attendance[courseKey][record.date] = {
            status: status as AttendanceStatus,
            reason: record.reason || undefined,
            date: record.date,
          }
        })

        return {
          ...student,
          id: studentId,
          attendance,
          courses: (courseRows || []).map((row) => String(row.course_id)),
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
    const supabase = getSupabaseClient()
    if (!supabase) return null

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

    return { ...data, id: String(data.id), attendance: {}, courses }
  } catch (error) {
    console.error("[v0] Unexpected error adding student:", error)
    return null
  }
}

export const deleteStudentFromSupabase = async (studentId: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return false

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
    const supabase = getSupabaseClient()
    if (!supabase) return false

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
  courseId: string | null,
  date: string,
  status: AttendanceStatus,
  reason?: string,
): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return false
    if (status === null) {
      // Delete attendance record (match course_id as well if provided)
      let query = supabase.from("attendance").delete().eq("student_id", studentId).eq("date", date)
      if (courseId) query = query.eq("course_id", courseId)

      const { error } = await query

      if (error) {
        console.error("[v0] Error deleting attendance:", { error, studentId, courseId, date })
        return false
      }
    } else {
      // Convert status format
      const dbStatus = status === "H" ? "present" : status === "G" ? "absent" : "excused"

      // Prepare upsert payload
      const payload: any = {
        student_id: studentId,
        date,
        status: dbStatus,
        reason: reason || null,
      }
      if (courseId) payload.course_id = courseId

      // Try upsert with course_id constraint first (new schema)
      // If it fails, fall back to old constraint
      let result = await supabase.from("attendance").upsert([payload], { onConflict: "student_id,course_id,date" })

      if (result.error) {
        const errorMsg = result.error.message || JSON.stringify(result.error)
        // If the constraint doesn't exist (old schema), try without course_id in conflict
        if (errorMsg.includes("course_id") || errorMsg.includes("constraint") || errorMsg.includes("23505")) {
          console.warn("[v0] New constraint not found, trying legacy upsert. Please apply migration from MIGRATION_GUIDE.md", errorMsg)
          result = await supabase.from("attendance").upsert([payload], { onConflict: "student_id,date" })
        }
      }

      if (result.error) {
        const errorDetails = {
          error: result.error,
          payload,
          studentId,
          courseId,
          date,
          hint: "If this error persists, apply the database migration: migrations/001_add_course_id_to_attendance.sql"
        }
        console.error("[v0] Error updating attendance:", errorDetails)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("[v0] Unexpected error updating attendance:", error)
    return false
  }
}

// 🔹 الإضافة: دالة client-side لتحديث الحضور محلياً بعد Supabase
export const updateAttendance = async (
  studentId: string,
  courseId: string | null,
  date: string,
  status: AttendanceStatus,
  reason?: string
) => {
  const success = await updateAttendanceInSupabase(studentId, courseId, date, status, reason)
  if (!success) return

  // تحديث الحالة محليًا في حالة استخدام state خارجي (مثلاً context)
  // هذه مجرد وظيفة مساعدة، لا تغيّر أي بيانات أخرى هنا
}

export const getCoursesFromSupabase = async (): Promise<Course[]> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return []

    const { data, error } = await supabase.from("courses").select("*")
    if (error) {
      console.error("[v0] Error fetching courses:", error)
      return []
    }
    return (data || []).map((course) => ({
      ...course,
      id: String(course.id),
    }))
  } catch (error) {
    console.error("[v0] Unexpected error fetching courses:", error)
    return []
  }
}

export const addCourseToSupabase = async (course: Course): Promise<Course | null> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { 
      name, 
      description, 
      level, 
      schedule, 
      instructor, 
      focus, 
      location, 
      color, 
      notes 
    } = course

    const { data, error } = await supabase
      .from("courses")
      .insert([{ 
        name, 
        description, 
        level, 
        schedule, 
        instructor, 
        focus, 
        location, 
        color, 
        notes 
      }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding course:", error)
      return null
    }
    return data ? { ...data, id: String(data.id) } : null
  } catch (error) {
    console.error("[v0] Unexpected error adding course:", error)
    return null
  }
}

export const updateCourseInSupabase = async (courseId: string, updates: Partial<Course>): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) return false

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
    const supabase = getSupabaseClient()
    if (!supabase) return false

    // 1. Delete course-student relations
    const { error: scError } = await supabase
      .from("student_courses")
      .delete()
      .eq("course_id", courseId)

    if (scError) {
      console.error("[v0] Error deleting student_courses:", scError)
      return false
    }

    // 2. Delete the course itself
    const { error: courseError } = await supabase.from("courses").delete().eq("id", courseId)
    if (courseError) {
      console.error("[v0] Error deleting course:", courseError)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Unexpected error deleting course:", error)
    return false
  }
}

export const getStorageData = async (): Promise<AttendanceData> => {
  const supabaseClient = getSupabaseClient()

  if (!supabaseClient) {
    // Fallback to local storage so pages still render when Supabase env vars are missing
    const local = getLocalAttendanceData()
    const localCourses = getStoredCourses()
    return {
      students: local.students,
      courses: local.courses.length ? local.courses : localCourses,
      lastUpdated: new Date().toISOString(),
    }
  }

  const [students, courses] = await Promise.all([getStudentsFromSupabase(), getCoursesFromSupabase()])
  const hasData = students.length > 0 || courses.length > 0

  if (hasData) {
    return {
      students,
      courses,
      lastUpdated: new Date().toISOString(),
    }
  }

  // Secondary fallback: if Supabase is reachable but empty, try local cache to avoid blank UI
  const local = getLocalAttendanceData()
  const localCourses = getStoredCourses()
  return {
    students: local.students,
    courses: local.courses.length ? local.courses : localCourses,
    lastUpdated: new Date().toISOString(),
  }
}

// ========== Debts CRUD ==========


export interface Debt {
  id: string;
  name: string;
  amount_owed: number;
  amount_paid: number;
}

export const getDebtsFromSupabase = async (): Promise<Debt[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching debts:", error);
    return [];
  }

  return data || [];
};

export const addDebtToSupabase = async (
  payload: Omit<Debt, "id">
): Promise<Debt | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("debts")
    .insert([
      {
        name: payload.name,
        amount_owed: payload.amount_owed,
        amount_paid: payload.amount_paid,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding debt:", error);
    return null;
  }

  return data;
};

export const updateDebtInSupabase = async (
  id: string,
  updates: Partial<Omit<Debt, "id">>
): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("debts")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating debt:", error);
    return false;
  }

  return true;
};

export const deleteDebtFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("debts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting debt:", error);
    return false;
  }

  return true;
};

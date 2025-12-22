import { createClient as createBrowserClient } from "./supabase/client"
import { getStorageData as getLocalAttendanceData } from "./storage"
import { getStoredCourses } from "./course-storage"
import type { AttendanceData, AttendanceRecord, AttendanceStatus, Course, Student } from "./types"

// ========== Student CRUD ==========

export const getStudentsFromSupabase = async (supabaseClient?: any): Promise<Student[]> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return []

    const { data: studentsData, error: studentsError } = await supabase.from("profiles").select("*")

    if (studentsError) {
      console.error("[v0] Error fetching profiles index:", JSON.stringify(studentsError, null, 2))
      return []
    }

    // Fetch attendance records and course assignments for each student
    const studentsWithExtras: Student[] = await Promise.all(
      (studentsData || []).map(async (studentRow: any) => {
        const studentId = String(studentRow.id)
        const [{ data: attendanceData, error: attendanceError }, { data: courseRows, error: courseError }] =
          await Promise.all([
            supabase.from("attendance").select("*").eq("student_id", studentId),
            supabase.from("student_courses").select("course_id").eq("student_id", studentId),
          ])

        if (attendanceError) {
          console.error("[v0] Error fetching attendance for student:", studentId, JSON.stringify(attendanceError, null, 2))
        }
        if (courseError) {
          console.error("[v0] Error fetching student_courses for student:", studentId, JSON.stringify(courseError, null, 2))
        }

        // attendance is now grouped by course
        const attendance: Record<string, Record<string, AttendanceRecord>> = {}
          ; (attendanceData || []).forEach((record: any) => {
            const status = record.status // Use raw status from DB (H, G, E)
            const courseKey = record.course_id ? String(record.course_id) : "_global"
            attendance[courseKey] = attendance[courseKey] || {}
            attendance[courseKey][record.date] = {
              status: status as AttendanceStatus,
              reason: record.reason || undefined,
              date: record.date,
            }
          })

        return {
          id: studentId,
          name: studentRow.full_name || "بدون اسم",
          email: studentRow.email || "",
          phone: studentRow.phone || "",
          notes: studentRow.debt_description || "",
          age: studentRow.age,
          total_debt: studentRow.total_debt,
          total_paid: studentRow.total_paid,
          warnings: studentRow.warnings,
          avatar_url: studentRow.avatar_url,
          gender: studentRow.gender,
          attendance,
          courses: (courseRows || []).map((row: any) => String(row.course_id)),
        } as Student
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
  supabaseClient?: any
): Promise<Student | null> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return null

    const { name, courses, notes, total_debt, total_paid, ...rest } = payload

    const { data, error } = await supabase
      .from("profiles")
      .insert([{
        full_name: name,
        debt_description: notes,
        total_debt,
        total_paid,
        ...rest
      }])
      .select()
      .maybeSingle()

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

export const updateStudentInSupabase = async (
  studentId: string,
  updates: Partial<Omit<Student, "id" | "attendance">> & { courses?: string[] },
  supabaseClient?: any
): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return false

    const { courses, name, notes, total_debt, total_paid, ...studentUpdates } = updates

    // Map fields back to DB schema
    const dbUpdates: any = { ...studentUpdates }
    if (name) dbUpdates.full_name = name
    if (notes) dbUpdates.debt_description = notes
    if (total_debt !== undefined) dbUpdates.total_debt = total_debt
    if (total_paid !== undefined) dbUpdates.total_paid = total_paid

    const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", studentId)

    if (error) {
      console.error("[v0] Error updating profile:", JSON.stringify(error, null, 2))
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

export const deleteStudentFromSupabase = async (studentId: string, supabaseClient?: any): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
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

    // Delete profile (student)
    const { error: studentError } = await supabase.from("profiles").delete().eq("id", studentId)
    if (studentError) {
      console.error("[v0] Error deleting profile:", studentError)
      return false
    }
    return true
  } catch (error) {
    console.error("[v0] Unexpected error deleting student:", error)
    return false
  }
}

// ========== Course CRUD ==========

export const getCoursesFromSupabase = async (supabaseClient?: any): Promise<Course[]> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return []

    const { data, error } = await supabase.from("courses").select("*")

    if (error) {
      console.error("[v0] Error fetching courses:", error)
      return []
    }

    return (data || []).map((course: any) => ({
      ...course,
      id: String(course.id),
    }))
  } catch (error) {
    console.error("[v0] Unexpected error fetching courses:", error)
    return []
  }
}

export const addCourseToSupabase = async (course: Course, supabaseClient?: any): Promise<Course | null> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
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
      notes,
      course_type
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
        notes,
        course_type: course_type || 'public'
      }])
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error adding course:", JSON.stringify(error, null, 2))
      return null
    }

    return data ? { ...data, id: String(data.id) } : null
  } catch (error) {
    console.error("[v0] Unexpected error adding course:", error)
    return null
  }
}

export const updateCourseInSupabase = async (courseId: string, updates: Partial<Course>, supabaseClient?: any): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
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

export const deleteCourseFromSupabase = async (courseId: string, supabaseClient?: any): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
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

// ========== Enrollment & Attendance ==========

const ensureStudentEnrolled = async (studentId: string, courseId: string, supabase: any) => {
  const { data, error } = await supabase
    .from('student_courses')
    .select('*')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .single();

  if (error || !data) {
    const { error: enrollError } = await supabase
      .from('student_courses')
      .insert([{ student_id: studentId, course_id: courseId }])
      .select();

    if (enrollError) {
      console.error('[v0] Error enrolling student:', enrollError);
      return false;
    }
  }
  return true;
};

export const updateAttendanceInSupabase = async (
  studentId: string,
  courseId: string | null,
  date: string,
  status: AttendanceStatus,
  reason?: string,
  supabaseClient?: any
): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient();
    if (!supabase || !studentId || !courseId) {
      console.error('[v0] Missing required parameters:', { studentId, courseId });
      return false;
    }

    const isEnrolled = await ensureStudentEnrolled(studentId, courseId, supabase);
    if (!isEnrolled) {
      console.error('[v0] Failed to enroll student in course');
      return false;
    }

    const payload = {
      student_id: studentId,
      course_id: courseId,
      date,
      status,
      reason: reason || null,
    };

    const { data, error } = await supabase
      .from('attendance')
      .upsert(payload, { onConflict: 'student_id,course_id,date' })
      .select();

    if (error) {
      console.error('[v0] Error in upsert operation:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        payload
      });
      // Fallback
      if (error.code === '42501') return false; // permission denied, let's stop recursion

      const { data: existing, error: fetchErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .eq('date', date)
        .single();

      if (existing) {
        await supabase.from('attendance').update(payload).eq('id', existing.id);
        return true;
      } else {
        await supabase.from('attendance').insert([payload]);
        return true;
      }
    }
    return true;
  } catch (error) {
    console.error('[v0] Unexpected error in updateAttendanceInSupabase:', error);
    return false;
  }
};

export const updateAttendance = async (
  studentId: string,
  courseId: string | null,
  date: string,
  status: AttendanceStatus,
  reason?: string
) => {
  const success = await updateAttendanceInSupabase(studentId, courseId, date, status, reason)
  if (!success) return
}

export const enrollInCourse = async (studentId: string, courseId: string, supabaseClient?: any): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return false

    const { error } = await supabase
      .from("student_courses")
      .insert([{ student_id: studentId, course_id: courseId }])

    if (error) {
      if (error.code === '23505') return true
      console.error("[v0] Error enrolling in course:", JSON.stringify(error, null, 2))
      return false
    }
    return true
  } catch (error) {
    console.error("[v0] Unexpected error enrolling in course:", error)
    return false
  }
}

export const unenrollStudentFromCourse = async (studentId: string, courseId: string, supabaseClient?: any): Promise<boolean> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return false

    const { error } = await supabase
      .from("student_courses")
      .delete()
      .eq("student_id", studentId)
      .eq("course_id", courseId)

    if (error) {
      console.error("[v0] Error unenrolling student:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("[v0] Unexpected error in unenrollStudentFromCourse:", error)
    return false
  }
}

export const getEnrollmentsForStudent = async (studentId: string, supabaseClient?: any): Promise<string[]> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from("student_courses")
      .select("course_id")
      .eq("student_id", studentId)

    if (error) {
      console.error("[v0] Error fetching enrollments:", JSON.stringify(error, null, 2))
      return []
    }

    return (data || []).map((row: any) => String(row.course_id))
  } catch (error) {
    console.error("[v0] Unexpected error fetching enrollments:", error)
    return []
  }
}

export const getStudentsInCourse = async (courseId: string, supabaseClient?: any): Promise<Student[]> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return []

    const { data: enrollments, error: enrollError } = await supabase
      .from("student_courses")
      .select("student_id")
      .eq("course_id", courseId)

    if (enrollError) {
      console.error("[v0] Error fetching enrollments for course:", courseId, enrollError)
      return []
    }

    const studentIds = enrollments.map((e: any) => e.student_id)
    if (studentIds.length === 0) return []

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", studentIds)

    if (profileError) {
      console.error("[v0] Error fetching profiles for course students:", profileError)
      return []
    }

    return (profiles || []).map((p: any) => ({
      id: p.id,
      name: p.full_name || "بدون اسم",
      phone: p.phone || "",
      notes: p.debt_description || "",
      age: p.age,
      total_debt: p.total_debt,
      total_paid: p.total_paid,
      avatar_url: p.avatar_url,
      gender: p.gender,
      attendance: {},
      courses: [courseId]
    } as Student))

  } catch (error) {
    console.error("[v0] Unexpected error in getStudentsInCourse:", error)
    return []
  }
}

export const getStudentsNotInCourse = async (courseId: string, supabaseClient?: any): Promise<Student[]> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return []

    const { data: allProfiles, error: profileError } = await supabase.from("profiles").select("*")
    if (profileError) {
      console.error("[v0] Error fetching all profiles:", profileError)
      return []
    }

    const { data: enrollments, error: enrollError } = await supabase
      .from("student_courses")
      .select("student_id")
      .eq("course_id", courseId)

    if (enrollError) {
      console.error("[v0] Error fetching enrollments:", enrollError)
      return []
    }

    const enrolledIds = new Set(enrollments.map((e: any) => e.student_id))

    return (allProfiles || [])
      .filter((p: any) => !enrolledIds.has(p.id))
      .map((p: any) => ({
        id: p.id,
        name: p.full_name || "بدون اسم",
        phone: p.phone || "",
        notes: p.debt_description || "",
        age: p.age,
        total_debt: p.total_debt,
        total_paid: p.total_paid,
        avatar_url: p.avatar_url,
        gender: p.gender,
        attendance: {},
      } as Student))

  } catch (error) {
    console.error("[v0] Unexpected error in getStudentsNotInCourse:", error)
    return []
  }
}

export const getStorageData = async (supabaseClient?: any): Promise<AttendanceData> => {
  const supabase = supabaseClient || createBrowserClient()
  if (!supabase) {
    const local = getLocalAttendanceData()
    const localCourses = getStoredCourses()
    return {
      students: local.students,
      courses: local.courses.length ? local.courses : localCourses,
      lastUpdated: new Date().toISOString(),
    }
  }

  const [students, courses] = await Promise.all([getStudentsFromSupabase(supabase), getCoursesFromSupabase(supabase)])
  const hasData = students.length > 0 || courses.length > 0
  if (hasData) {
    return {
      students,
      courses,
      lastUpdated: new Date().toISOString(),
    }
  }

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
  student_id?: string;
}

export const getDebtsFromSupabase = async (supabaseClient?: any): Promise<Debt[]> => {
  const supabase = supabaseClient || createBrowserClient();
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
  payload: Omit<Debt, "id">,
  supabaseClient?: any
): Promise<Debt | null> => {
  const supabase = supabaseClient || createBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("debts")
    .insert([
      {
        name: payload.name,
        amount_owed: payload.amount_owed,
        amount_paid: payload.amount_paid,
        student_id: payload.student_id,
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
  updates: Partial<Omit<Debt, "id">>,
  supabaseClient?: any
): Promise<boolean> => {
  const supabase = supabaseClient || createBrowserClient();
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

export const deleteDebtFromSupabase = async (id: string, supabaseClient?: any): Promise<boolean> => {
  const supabase = supabaseClient || createBrowserClient();
  if (!supabase) return false;

  const { error } = await supabase.from("debts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting debt:", error);
    return false;
  }

  return true;
};

// ========== Payment Requests ==========

export interface PaymentRequest {
  id: string
  student_id: string
  debt_id: string
  amount: number
  note: string | null
  proof_image_url: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export const createPaymentRequest = async (
  payload: {
    student_id: string
    debt_id: string
    amount: number
    note?: string
    proof_image_url?: string
  },
  supabaseClient?: any
): Promise<PaymentRequest | null> => {
  const supabase = supabaseClient || createBrowserClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("payment_requests")
    .insert([{
      student_id: payload.student_id,
      debt_id: payload.debt_id,
      amount: payload.amount,
      note: payload.note,
      proof_image_url: payload.proof_image_url
    }])
    .select()
    .single()

  if (error) {
    console.error("Error creating payment request:", error)
    return null
  }

  return data
}

export const getPaymentRequests = async (
  status: "pending" | "approved" | "rejected" | "all" = "all",
  supabaseClient?: any
): Promise<any[]> => {
  const supabase = supabaseClient || createBrowserClient()
  if (!supabase) return []

  let query = supabase
    .from("payment_requests")
    .select(`
      *,
      student:profiles(full_name),
      debt:debts(name, amount_owed, amount_paid)
    `)
    .order("created_at", { ascending: false })

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching payment requests:", error)
    return []
  }

  return data
}

export const updatePaymentRequestStatus = async (
  requestId: string,
  newStatus: "approved" | "rejected",
  supabaseClient?: any
): Promise<boolean> => {
  const supabase = supabaseClient || createBrowserClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("payment_requests")
    .update({ status: newStatus })
    .eq("id", requestId)

  if (error) {
    console.error("Error updating payment request status:", error)
    return false
  }

  if (newStatus === "approved") {
    const { data: request } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (request) {
      const { data: debt } = await supabase
        .from("debts")
        .select("amount_paid")
        .eq("id", request.debt_id)
        .single()

      if (debt) {
        await supabase
          .from("debts")
          .update({ amount_paid: (debt.amount_paid || 0) + Number(request.amount) })
          .eq("id", request.debt_id)
      }
    }
  }

  return true
}

export const uploadPaymentProof = async (
  file: File,
  studentId: string,
  supabaseClient?: any
): Promise<string | null> => {
  try {
    const supabase = supabaseClient || createBrowserClient()
    if (!supabase) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${studentId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading proof:", uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error("Unexpected error in uploadPaymentProof:", error)
    return null
  }
}

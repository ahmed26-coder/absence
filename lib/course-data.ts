import type { Student, Course } from "./types"
import { getStudentStats } from "./storage"
import { getStoredCourses } from "./course-storage"


export interface CourseOverview extends Course {
  studentIds: string[]
  trend: Array<{ date: string; present: number; absent: number; excused: number }>
  averageAttendance: number
  description?: string
  notes?: string
}

export interface StudentCourseSummary {
  courseId: string
  courseName: string
  attendanceRate: number
  totalSessions: number
}

const formatDate = (date: Date) => date.toISOString().split("T")[0]

const recentDates = (count: number) => {
  const today = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - i * 2)
    return formatDate(d)
  }).sort()
}

type BaseCourse = Course | CourseOverview

export const buildCourseData = (
  students: Student[],
  existingCourses?: BaseCourse[],
): {
  courses: CourseOverview[]
  studentsWithCourses: StudentWithCourses[]
  assignments: Record<string, string[]>
  sessionDates: string[]
  studentCourseSummaries: Record<string, StudentCourseSummary[]>
} => {
  const sessionDates = recentDates(10)
  const storedCourses: BaseCourse[] = existingCourses && existingCourses.length > 0 ? existingCourses : getStoredCourses()
  const courses: CourseOverview[] = storedCourses.map((course) => {
    const assignedStudents = students.filter((student) => student.courses?.includes(course.id))

    const trend = sessionDates.map((date) => {
      let present = 0
      let absent = 0
      let excused = 0

      assignedStudents.forEach((student) => {
        const record = student.attendance?.[course.id]?.[date]
        if (record?.status === "H") present += 1
        else if (record?.status === "G") absent += 1
        else if (record?.status === "E") excused += 1
      })

      return { date, present, absent, excused }
    })

    const totalSlots = sessionDates.length * Math.max(assignedStudents.length, 1)
    const totalPresence = trend.reduce((acc, session) => acc + session.present + session.excused * 0.5, 0) || 0
    const averageAttendance = totalSlots ? Math.round((totalPresence / totalSlots) * 100) : 0

    return {
      ...course,
      studentIds: assignedStudents.map((s) => s.id),
      trend,
      averageAttendance,
    }
  })

  const studentsWithCourses: StudentWithCourses[] = students.map((student) => ({
    ...student,
    courses: student.courses || [],
  }))

  const assignments = studentsWithCourses.reduce<Record<string, string[]>>((acc, student) => {
    acc[student.id] = student.courses || []
    return acc
  }, {})

  const studentCourseSummaries = studentsWithCourses.reduce<Record<string, StudentCourseSummary[]>>(
    (acc, student) => {
      acc[student.id] = (assignments[student.id] || []).map((courseId) => {
        const course = courses.find((c) => c.id === courseId)
        const stats = getStudentStats(student, undefined, undefined, courseId)
        const totalSessions = stats.present + stats.absent + stats.excused
        const attendanceRate =
          totalSessions > 0 ? Math.round((stats.present / totalSessions) * 100) : 0

        return {
          courseId,
          courseName: course?.name || "دورة",
          attendanceRate,
          totalSessions,
        }
      })
      return acc
    },
    {},
  )


  return { courses, studentsWithCourses, assignments, sessionDates, studentCourseSummaries }
}

export type StudentWithCourses = Student & { courses?: string[] }

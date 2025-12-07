import type { Student } from "./types"
import { getStudentStats } from "./storage"

export interface Course {
  id: string
  name: string
  instructor: string
  schedule: string
  level: string
  focus: string
  location: string
  color: string
}

export interface CourseOverview extends Course {
  studentIds: string[]
  trend: Array<{ date: string; present: number; absent: number; excused: number }>
  averageAttendance: number
}

export interface StudentCourseSummary {
  courseId: string
  courseName: string
  attendanceRate: number
  totalSessions: number
}

const courseCatalog: Course[] = [
  {
    id: "tajweed",
    name: "دورة التجويد المتقدم",
    instructor: "الشيخ أبو عبد الرحمن",
    schedule: "الأحد - الثلاثاء",
    level: "متقدم",
    focus: "تصحيح التلاوة وأحكام التجويد",
    location: "قاعة الحديث",
    color: "emerald",
  },
  {
    id: "fiqh",
    name: "فقه العبادات",
    instructor: "الشيخ سفيان",
    schedule: "الإثنين - الأربعاء",
    level: "متوسط",
    focus: "كتاب الطهارة والصلاة",
    location: "قاعة الفقه",
    color: "indigo",
  },
  {
    id: "aqeedah",
    name: "العقيدة الطحاوية",
    instructor: "الشيخ الحارث",
    schedule: "الخميس",
    level: "مكثف",
    focus: "أصول الاعتقاد",
    location: "قاعة العقيدة",
    color: "amber",
  },
  {
    id: "seerah",
    name: "سيرة النبي صلى الله عليه وسلم",
    instructor: "الشيخ أنس",
    schedule: "الجمعة",
    level: "مبتدئ",
    focus: "محطات من السيرة",
    location: "مكتبة المسجد",
    color: "cyan",
  },
]

const formatDate = (date: Date) => date.toISOString().split("T")[0]

const recentDates = (count: number) => {
  const today = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - i * 2)
    return formatDate(d)
  }).sort()
}

const buildAssignments = (students: Student[]) => {
  const courseIds = courseCatalog.map((c) => c.id)
  return students.reduce<Record<string, string[]>>((acc, student, index) => {
    const primary = courseIds[index % courseIds.length]
    const secondary = courseIds[(index + 1) % courseIds.length]
    const bonus = index % 3 === 0 ? courseIds[(index + 2) % courseIds.length] : null

    acc[student.id] = [primary, secondary, bonus].filter(Boolean) as string[]
    return acc
  }, {})
}

export const buildCourseData = (
  students: Student[],
): {
  courses: CourseOverview[]
  studentsWithCourses: StudentWithCourses[]
  assignments: Record<string, string[]>
  sessionDates: string[]
  studentCourseSummaries: Record<string, StudentCourseSummary[]>
} => {
  const assignments = buildAssignments(students)
  const sessionDates = recentDates(6)

  const courses: CourseOverview[] = courseCatalog.map((course) => {
    const assignedStudents = students.filter((student) => assignments[student.id]?.includes(course.id))

    const trend = sessionDates.map((date) => {
      let present = 0
      let absent = 0
      let excused = 0

      assignedStudents.forEach((student) => {
        const record = student.attendance?.[date]
        if (record?.status === "H") present += 1
        else if (record?.status === "G") absent += 1
        else if (record?.status === "E") excused += 1
      })

      return { date, present, absent, excused }
    })

    const totalSlots = sessionDates.length * Math.max(assignedStudents.length, 1)
    const totalPresence =
      trend.reduce((acc, session) => acc + session.present + session.excused * 0.5, 0) || 0
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
    courses: assignments[student.id] || [],
  }))

  const studentCourseSummaries = studentsWithCourses.reduce<Record<string, StudentCourseSummary[]>>(
    (acc, student) => {
      acc[student.id] = (assignments[student.id] || []).map((courseId) => {
        const course = courseCatalog.find((c) => c.id === courseId)
        const stats = getStudentStats(student)
        const totalSessions = stats.present + stats.absent + stats.excused

        return {
          courseId,
          courseName: course?.name || "دورة",
          attendanceRate: stats.presentPercentage,
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

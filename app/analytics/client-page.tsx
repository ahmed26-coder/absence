"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, Users, NotebookPen, Calendar, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { StatisticsPanel } from "@/components/statistics-panel"
import { buildCourseData } from "@/lib/course-data"

const AnalyticsContent = () => {
  const { data } = useAttendance()
  const { studentsWithCourses, courses } = useMemo(
    () => buildCourseData(data.students, data.courses),
    [data.students, data.courses],
  )

  const totalStudents = studentsWithCourses.length
  const totalCourses = courses.length
  const averageAttendance =
    courses.length > 0
      ? Math.round(
        courses.reduce((acc, c) => acc + (c.averageAttendance || 0), 0) / Math.max(1, courses.length),
      )
      : 0

  // Calculate global statistics
  const globalStats = useMemo(() => {
    let totalSessions = 0
    let totalPresent = 0
    let totalAbsent = 0
    let totalExcused = 0

    // Iterate through all students and their attendance records
    studentsWithCourses.forEach((student) => {
      if (student.attendance) {
        // Iterate through all courses for this student
        Object.values(student.attendance).forEach((courseAttendance) => {
          // Iterate through all dates for this course
          Object.values(courseAttendance).forEach((record) => {
            totalSessions++
            if (record.status === "H") totalPresent++
            else if (record.status === "G") totalAbsent++
            else if (record.status === "E") totalExcused++
          })
        })
      }
    })

    return {
      totalSessions,
      totalPresent,
      totalAbsent,
      totalExcused,
    }
  }, [studentsWithCourses])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-sm backdrop-blur"
        >
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              لوحة الإحصائيات
            </p>
            <h1 className="text-3xl font-black text-foreground leading-tight">نظرة عامة سريعة على الأداء</h1>
            <p className="text-sm text-muted-foreground">
              إجماليات الطلاب والدورات مع متوسط نسب الحضور، إضافة إلى بطاقات تفصيلية للأيام الأخيرة.
            </p>
          </div>
        </motion.div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
              <Users size={16} className="text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{totalStudents}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">إجمالي الدورات</p>
              <NotebookPen size={16} className="text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{totalCourses}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">متوسط نسب الحضور</p>
              <BarChart3 size={16} className="text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{averageAttendance}%</p>
          </div>
        </div>

        {/* Global Attendance Statistics */}
        <div className="rounded-2xl border border-border/60 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar size={20} />
            إحصائيات الحضور الشاملة
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-blue-50 to-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">إجمالي الجلسات</p>
                <Calendar size={16} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{globalStats.totalSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">عبر جميع الدورات</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-green-50 to-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">إجمالي الحضور</p>
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-700">{globalStats.totalPresent}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {globalStats.totalSessions > 0
                  ? `${Math.round((globalStats.totalPresent / globalStats.totalSessions) * 100)}% من الجلسات`
                  : "لا توجد جلسات"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-red-50 to-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">إجمالي الغياب</p>
                <XCircle size={16} className="text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-700">{globalStats.totalAbsent}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {globalStats.totalSessions > 0
                  ? `${Math.round((globalStats.totalAbsent / globalStats.totalSessions) * 100)}% من الجلسات`
                  : "لا توجد جلسات"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-yellow-50 to-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">إجمالي الأعذار</p>
                <AlertCircle size={16} className="text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-700">{globalStats.totalExcused}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {globalStats.totalSessions > 0
                  ? `${Math.round((globalStats.totalExcused / globalStats.totalSessions) * 100)}% من الجلسات`
                  : "لا توجد جلسات"}
              </p>
            </div>
          </div>
        </div>

        <StatisticsPanel students={studentsWithCourses} startDate={new Date().toISOString().split("T")[0]} endDate={new Date().toISOString().split("T")[0]} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AttendanceProvider>
      <AnalyticsContent />
    </AttendanceProvider>
  )
}

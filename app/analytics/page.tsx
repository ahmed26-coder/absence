"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, Users, NotebookPen } from "lucide-react"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { StatisticsPanel } from "@/components/statistics-panel"
import { buildCourseData } from "@/lib/course-data"
import { useCourses } from "@/lib/use-courses"

const AnalyticsContent = () => {
  const { data } = useAttendance()
  const { courses } = useCourses()
  const { studentsWithCourses } = useMemo(() => buildCourseData(data.students, courses), [data.students, courses])

  const totalStudents = studentsWithCourses.length
  const totalCourses = courses.length
  const averageAttendance =
    courses.length > 0
      ? Math.round(
          courses.reduce((acc, c) => acc + (c.averageAttendance || 0), 0) / Math.max(1, courses.length),
        )
      : 0

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

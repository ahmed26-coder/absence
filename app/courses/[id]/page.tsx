"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock, List, Grid3x3, Users, XCircle } from "lucide-react"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { StudentCard } from "@/components/student-card"
import { StudentsTable } from "@/components/students-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buildCourseData, type StudentWithCourses } from "@/lib/course-data"

interface CourseDetailsPageProps {
  params: { id: string }
}

interface CourseDetailsPageClientProps {
  courseId: string
}

const StatsCard = ({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number
  icon: typeof Users
  tone?: "default" | "success" | "danger" | "muted"
}) => {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "bg-rose-50 text-rose-700"
        : tone === "muted"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-50 text-slate-800"

  return (
    <div className={`flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3 shadow-sm ${toneClasses}`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-current shadow-inner">
        <Icon size={18} />
      </span>
    </div>
  )
}

const CourseDetailsContent = ({ courseId }: CourseDetailsPageClientProps) => {
  const { data } = useAttendance()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "excused">("all")
  const [viewMode, setViewMode] = useState<"list" | "card">(() => {
    if (typeof window !== "undefined") {
      return ((localStorage.getItem("courseViewMode") as "list" | "card") || "card") as "list" | "card"
    }
    return "card"
  })
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 9

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("courseViewMode", viewMode)
    }
  }, [viewMode])

  const { courses, studentsWithCourses, studentCourseSummaries } = useMemo(
    () => buildCourseData(data.students, data.courses),
    [data.students, data.courses],
  )

  const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId])

  const courseLabels = useMemo(
    () => courses.reduce<Record<string, string>>((acc, c) => ({ ...acc, [c.id]: c.name }), {}),
    [courses],
  )

  const courseStudents = useMemo(
    () => studentsWithCourses.filter((student) => student.courses?.includes(courseId)),
    [studentsWithCourses, courseId],
  )

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return courseStudents.filter((student: StudentWithCourses) => {
      const record = student.attendance?.[selectedDate]
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        (record?.status === "H" && "حاضر".includes(term)) ||
        (record?.status === "G" && "غياب".includes(term)) ||
        (record?.status === "E" && "عذر".includes(term))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "present" && record?.status === "H") ||
        (statusFilter === "absent" && record?.status === "G") ||
        (statusFilter === "excused" && record?.status === "E")

      return matchesSearch && matchesStatus
    })
  }, [courseStudents, searchTerm, statusFilter, selectedDate])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))
  const paginatedStudents = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredStudents.slice(start, start + itemsPerPage)
  }, [filteredStudents, currentPage])

  const stats = useMemo(() => {
    const base = { total: courseStudents.length, present: 0, absent: 0, excused: 0 }
    return courseStudents.reduce((acc, student) => {
      const record = student.attendance?.[selectedDate]
      if (record?.status === "H") acc.present += 1
      else if (record?.status === "G") acc.absent += 1
      else if (record?.status === "E") acc.excused += 1
      return acc
    }, base)
  }, [courseStudents, selectedDate])

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-border/60 bg-white/90 p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">لا يمكن العثور على هذه الدورة.</p>
          <p className="text-sm text-muted-foreground">تأكد من صحة الرابط أو عد إلى قائمة الدورات.</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/courses">العودة إلى الدورات</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleViewStudent = () => {}

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-6 md:p-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/courses" className="inline-flex items-center gap-1 text-primary hover:underline">
                <ArrowRight size={14} />
                عودة إلى الدورات
              </Link>
              <span className="text-border">/</span>
              <span className="font-semibold text-foreground">تفاصيل الدورة</span>
            </div>
            <h1 className="text-3xl font-black text-foreground">{course.name}</h1>
            <p className="text-sm text-muted-foreground">{course.description || "لا يوجد وصف للدورة حالياً."}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setViewMode("card")}
              aria-label="عرض كبطاقات"
            >
              <Grid3x3 size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
              aria-label="عرض كقائمة"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Users size={14} />
                {stats.total} طلاب مسجلون
              </div>
              <p className="text-sm text-muted-foreground">
                الشيخ: <span className="font-semibold text-foreground">{course.instructor}</span>
              </p>
              <p className="text-sm text-muted-foreground">الجدول: {course.schedule}</p>
              <p className="text-sm text-muted-foreground">الموقع: {course.location || "—"}</p>
              <p className="text-sm text-muted-foreground">المستوى: {course.level || "—"}</p>
            </div>
            <div className="flex w.full max-w-sm flex-col gap-2">
              <label className="text-sm font-semibold text-foreground">تاريخ الجلسة</label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="إجمالي الطلاب" value={stats.total} icon={Users} />
            <StatsCard label="حاضر" value={stats.present} icon={CheckCircle2} tone="success" />
            <StatsCard label="غياب" value={stats.absent} icon={XCircle} tone="danger" />
            <StatsCard label="عذر" value={stats.excused} icon={Clock} tone="muted" />
          </div>
        </div>

        <section id="students" className="space-y-4 rounded-2xl border border-border/60 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">قائمة الطلاب</h2>
              <p className="text-sm text-muted-foreground">تصفية بالاسم أو حالة الحضور مع تحديث فوري.</p>
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                type="text"
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(0)
                }}
              />
              <select
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter)
                  setCurrentPage(0)
                }}
              >
                <option value="all">كل الحالات</option>
                <option value="present">حاضر</option>
                <option value="absent">غياب</option>
                <option value="excused">عذر</option>
              </select>
            </div>
          </div>

          {viewMode === "list" && (
            <StudentsTable
              students={paginatedStudents}
              studentCourseSummaries={studentCourseSummaries}
              onView={handleViewStudent}
              onEdit={() => {}}
              onDelete={() => {}}
              onAddNew={() => {}}
              search={searchTerm}
              onSearchChange={(value) => {
                setSearchTerm(value)
                setCurrentPage(0)
              }}
              showToolbar={false}
            />
          )}

          {viewMode === "card" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {paginatedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  selectedDate={selectedDate}
                  courseLabels={courseLabels}
                  onNavigateToCourse={() => {}}
                  courseSummaries={studentCourseSummaries[student.id]}
                />
              ))}
            </div>
          )}

          {filteredStudents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-8 text-center text-muted-foreground">
              لا توجد طلاب مطابقة للبحث الحالي. جرّب تصفية مختلفة.
            </div>
          )}

          {filteredStudents.length > 0 && totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} variant="outline">
                السابق
              </Button>
              <div className="flex items.center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                variant="outline"
              >
                التالي
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const CourseDetailsPage = ({ courseId }: CourseDetailsPageClientProps) => (
  <AttendanceProvider>
    <CourseDetailsContent courseId={courseId} />
  </AttendanceProvider>
)

export default function CourseDetailsPageWrapper({ params }: CourseDetailsPageProps) {
  // In Next 16 (Turbopack), params is a Promise in client components
  const { id } = use(params as unknown as Promise<{ id: string }>)
  return <CourseDetailsPage courseId={id} />
}


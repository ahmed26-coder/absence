// Courses and attendance workspace
"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Users, Compass, Grid3x3, List, Search, Filter, NotebookPen, BarChart3, Gauge } from "lucide-react"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { StudentCard } from "@/components/student-card"
import { DateRangeSelector } from "@/components/date-range-selector"
import { StatisticsPanel } from "@/components/statistics-panel"
import { ExportButton } from "@/components/export-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AttendanceStatusButton } from "@/components/attendance-status-button"
import { buildCourseData, type CourseOverview, type StudentWithCourses } from "@/lib/course-data"
import { CoursesTable } from "@/components/courses-table"
import { CourseForm } from "@/components/course-form"
import { StudentsTable } from "@/components/students-table"
import { StudentForm } from "@/components/student-form"
import { Dialog } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-provider"
import type { Student } from "@/lib/types"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { StudentDetailsModal } from "@/components/student-details-modal"

const DEFAULT_SHEIKH = "الشيخ عمرو بن أبي الفتوح"

const CourseCard = ({
  course,
  onSelect,
  isActive,
}: {
  course: CourseOverview
  onSelect: (id: string) => void
  isActive: boolean
}) => {
  const maxTrend =
    course.trend.length > 0 ? Math.max(...course.trend.map((t) => t.present + t.excused + t.absent), 1) : 1

  return (
    <button
      type="button"
      onClick={() => onSelect(course.id)}
      className={`relative w-full rounded-2xl border border-border/60 bg-white/80 p-4 text-start shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
        isActive ? "ring-2 ring-primary/30 border-primary/50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{course.schedule}</p>
          <p className="text-base font-bold text-foreground">{course.name}</p>
          <p className="text-xs text-muted-foreground">الشيخ: {course.instructor || DEFAULT_SHEIKH}</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{course.level}</div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users size={14} />
          {course.studentIds.length} طلاب
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 size={14} />
          متوسط الحضور {course.averageAttendance}%
        </span>
        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold">{course.focus}</span>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-1.5">
        {course.trend.map((session) => {
          const total = session.present + session.absent + session.excused || 1
          const height = Math.round(((session.present + session.excused * 0.5) / maxTrend) * 100)
          const rate = Math.round((session.present / total) * 100)
          return (
            <div key={session.date} className="flex flex-col items-center gap-1">
              <div
                className="w-full rounded-full bg-gradient-to-t from-emerald-200 via-emerald-300 to-emerald-500"
                style={{ height: `${Math.max(12, height)}px` }}
                title={`الحضور ${rate}% | غياب ${session.absent}`}
              />
              <span className="text-[10px] text-muted-foreground">{session.date.split("-").slice(1).join("/")}</span>
            </div>
          )
        })}
      </div>
    </button>
  )
}

const CoursesContent = () => {
  const { data, isLoading, updateAttendance, deleteStudent, addStudent, updateStudent, addCourse, updateCourse, deleteCourse } =
    useAttendance()
  const { pushToast } = useToast()
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseOverview | null>(null)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [profileStudent, setProfileStudent] = useState<Student | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [filterDate, setFilterDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "excused">("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "card">(() => {
    if (typeof window !== "undefined") {
      return ((localStorage.getItem("viewMode") as "list" | "card") || "card") as "list" | "card"
    }
    return "card"
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null)
  const [courseStudentSearch, setCourseStudentSearch] = useState("")
  const [courseStatusFilter, setCourseStatusFilter] = useState<"all" | "present" | "absent" | "excused">("all")
  const [courseDate, setCourseDate] = useState(new Date().toISOString().split("T")[0])
  const [courseToDelete, setCourseToDelete] = useState<CourseOverview | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [showCourseDetails, setShowCourseDetails] = useState(false)
  const itemsPerPage = 12

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", viewMode)
    }
  }, [viewMode])

  const baseCourses = useMemo(() => data.courses || [], [data.courses])
  const { courses, studentsWithCourses, studentCourseSummaries, sessionDates } = useMemo(
    () => buildCourseData(data.students, baseCourses),
    [data.students, baseCourses],
  )
  const [studentMeta, setStudentMeta] = useState<
    Record<
      string,
      { phone?: string; email?: string; notes?: string; courseIds?: string[]; age?: number; debt?: number; warnings?: number }
    >
  >({})

  useEffect(() => {
    setCourseDate(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    if (!activeCourseId && courses[0]) {
      setActiveCourseId(courses[0].id)
    }
  }, [courses, activeCourseId])

  const courseLabels = useMemo(
    () => courses.reduce<Record<string, string>>((acc, course) => ({ ...acc, [course.id]: course.name }), {}),
    [courses],
  )

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return studentsWithCourses.filter((student: StudentWithCourses) => {
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        (student.courses || []).some((courseId) => (courseLabels[courseId] || "").toLowerCase().includes(term))

      const matchesCourse = courseFilter === "all" || student.courses?.includes(courseFilter)
      const record = student.attendance?.[selectedDate]
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "present" && record?.status === "H") ||
        (statusFilter === "absent" && record?.status === "G") ||
        (statusFilter === "excused" && record?.status === "E")

      const matchesFilterDate = !filterDate || Boolean(student.attendance?.[filterDate])
      return matchesSearch && matchesCourse && matchesStatus && matchesFilterDate
    })
  }, [studentsWithCourses, searchTerm, courseFilter, statusFilter, selectedDate, filterDate, courseLabels])

  const paginatedStudents = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredStudents.slice(start, start + itemsPerPage)
  }, [filteredStudents, currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))

  const activeCourse = courses.find((course) => course.id === activeCourseId)

  const courseStudents = useMemo(
    () =>
      studentsWithCourses.filter((student) =>
        activeCourseId ? student.courses?.includes(activeCourseId) : student.courses?.length,
      ),
    [studentsWithCourses, activeCourseId],
  )

  const filteredCourseStudents = useMemo(() => {
    const term = courseStudentSearch.trim().toLowerCase()
    return courseStudents.filter((student) => {
      const matchesSearch = !term || student.name.toLowerCase().includes(term)
      const record = student.attendance?.[courseDate]
      const matchesStatus =
        courseStatusFilter === "all" ||
        (courseStatusFilter === "present" && record?.status === "H") ||
        (courseStatusFilter === "absent" && record?.status === "G") ||
        (courseStatusFilter === "excused" && record?.status === "E")

      return matchesSearch && matchesStatus
    })
  }, [courseStudents, courseStudentSearch, courseStatusFilter, courseDate])

  const handleNavigateToCourse = (courseId: string, openDetails = false) => {
    setActiveCourseId(courseId)
    if (openDetails) {
      setShowCourseDetails(true)
    }
    const section = document.getElementById("courses")
    section?.scrollIntoView({ behavior: "smooth" })
  }

  const studentLookup = useMemo(
    () =>
      studentsWithCourses.reduce<Record<string, Student>>((acc, student) => {
        const meta = studentMeta[student.id] || {}
        acc[student.id] = { ...student, ...meta }
        return acc
      }, {}),
    [studentsWithCourses, studentMeta],
  )

  const handleViewStudent = (studentId: string) => {
    const s = studentLookup[studentId]
    if (s) {
      setProfileStudent(s)
      document.getElementById("students")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleEditStudent = (studentId: string) => {
    setEditingStudentId(studentId)
    setShowStudentForm(true)
  }

  const handleDeleteStudentTrigger = (studentId: string) => {
    const s = studentLookup[studentId]
    if (s) setStudentToDelete(s)
  }

  const handleCourseSubmit = (course: CourseOverview & { description?: string; notes?: string }) => {
    const exists = courses.some((c) => c.id === course.id)
    const payload = {
      id: course.id,
      name: course.name,
      instructor: course.instructor || DEFAULT_SHEIKH,
      schedule: course.schedule || "—",
      level: course.level || "—",
      focus: course.focus || "—",
      location: course.location || "—",
      color: course.color || "emerald",
      description: course.description,
      notes: course.notes,
    }
    const action = exists ? updateCourse(course.id, payload) : addCourse(payload)
    action
      .then((res) => {
        if (res) {
          if (!activeCourseId) setActiveCourseId(payload.id)
          pushToast(exists ? "تم تحديث بيانات الدورة" : "تمت إضافة الدورة", "success")
          setShowCourseForm(false)
          setEditingCourse(null)
        } else {
          pushToast("تعذّر حفظ الدورة في قاعدة البيانات", "error")
        }
      })
      .catch(() => pushToast("تعذّر حفظ الدورة في قاعدة البيانات", "error"))
  }

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return
    deleteCourse(courseToDelete.id)
      .then((ok) => {
        if (ok && activeCourseId === courseToDelete.id) {
          const next = courses.filter((c) => c.id !== courseToDelete.id)
          setActiveCourseId(next[0]?.id || null)
        }
        pushToast(ok ? "تم حذف الدورة" : "تعذّر حذف الدورة من قاعدة البيانات", ok ? "success" : "error")
      })
      .finally(() => setCourseToDelete(null))
  }

  const handleStudentSubmit = async (payload: {
    name: string
    phone?: string
    email?: string
    notes?: string
    courseIds: string[]
    id?: string
    age?: number
    debt?: number
    warnings?: number
  }) => {
    if (payload.id) {
      await updateStudent(payload.id, {
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        notes: payload.notes,
        courses: payload.courseIds,
        age: payload.age,
        debt: payload.debt,
        warnings: payload.warnings,
      })
      setStudentMeta((prev) => ({
        ...prev,
        [payload.id as string]: {
          phone: payload.phone,
          email: payload.email,
          notes: payload.notes,
          courseIds: payload.courseIds,
          age: payload.age,
          debt: payload.debt,
          warnings: payload.warnings,
        },
      }))
      pushToast("تم تحديث بيانات الطالب", "success")
    } else {
      const created = await addStudent({
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        notes: payload.notes,
        courses: payload.courseIds,
        age: payload.age,
        debt: payload.debt,
        warnings: payload.warnings,
      })
      if (created) {
        setStudentMeta((prev) => ({
          ...prev,
          [created.id]: {
            phone: payload.phone,
            email: payload.email,
            notes: payload.notes,
            courseIds: payload.courseIds,
            age: payload.age,
            debt: payload.debt,
            warnings: payload.warnings,
          },
        }))
        pushToast("تمت إضافة الطالب", "success")
      } else {
        pushToast("تعذّر إضافة الطالب", "error")
      }
    }
    setShowStudentForm(false)
    setEditingStudentId(null)
  }

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return
    await deleteStudent(studentToDelete.id)
    pushToast("تم حذف الطالب", "success")
    setStudentToDelete(null)
  }

  const editingStudent = editingStudentId ? studentLookup[editingStudentId] : undefined
  const editingStudentMeta = editingStudentId ? studentMeta[editingStudentId] : undefined

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/90 p-8 shadow-md backdrop-blur"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.08),transparent_30%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                <Compass size={14} />
                لوحة حضور الدورات
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                منصة عربية لمتابعة الحضور والغياب مع نظرة فورية على التزام الطلاب
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                وصول سريع لقوائم الطلاب، الدورات، ونافذة إدخال الحضور اليومية. كل شيء باللغة العربية وبواجهة RTL واضحة.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 font-semibold text-primary">
                  الطلاب المسجلون: {data.students.length}
                </span>
                <span className="rounded-full bg-amber-100 px-4 py-1.5 font-semibold text-amber-800">
                  جلسة اليوم: {selectedDate}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    setEditingCourse(null)
                    setShowCourseForm(true)
                  }}
                  size="lg"
                  className="gap-2 px-6 py-2.5"
                >
                  <NotebookPen size={18} />
                  إضافة دورة
                </Button>
                <ExportButton students={filteredStudents} startDate={startDate} endDate={endDate} />
              </div>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <label className="text-sm font-semibold text-foreground">بحث شامل</label>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-inner">
                <Search size={16} className="text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(0)
                  }}
                  placeholder="ابحث عن طالب أو دورة"
                  className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-base"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                استخدم البحث السريع للوصول إلى طالب محدد، أو انتقل مباشرة للدورة لمعالجة الحضور.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: "قائمة الدورات", icon: NotebookPen, target: "courses" },
            { title: "قائمة الطلاب", icon: Users, target: "students" },
            { title: "نظرة عامة على الإحصائيات", icon: Gauge, target: "analytics" },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white/90 px-5 py-4 text-start shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">انتقل سريعاً للعمل على هذه الشاشة</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon size={18} />
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white/90 p-6 shadow-sm backdrop-blur space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">تاريخ الجلسة الحالية</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setCurrentPage(0)
                }}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">تصفية حسب تسجيل تاريخ</label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value)
                  setCurrentPage(0)
                }}
                placeholder="اختر تاريخ للتصفية"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">حالة الحضور</label>
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
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">الدورة</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value)
                  setCurrentPage(0)
                }}
              >
                <option value="all">كل الدورات</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                <Filter size={14} />
                {filteredStudents.length} نتائج
              </span>
              <Button
                onClick={() => setViewMode("card")}
                variant={viewMode === "card" ? "default" : "outline"}
                size="icon-sm"
                aria-label="عرض كبطاقات"
              >
                <Grid3x3 size={16} />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon-sm"
                aria-label="عرض كقائمة"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div id="analytics">
          <StatisticsPanel students={filteredStudents} startDate={startDate} endDate={endDate} />
        </div>

        <section id="students" className="space-y-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">قائمة الطلاب</h2>
              <p className="text-sm text-muted-foreground">
                تصفية بالاسم، الحالة، أو الدورة، مع تحديث فوري لسجلات الحضور.
              </p>
            </div>
          </div>

          {viewMode === "list" && (
            <StudentsTable
              students={paginatedStudents}
              studentCourseSummaries={studentCourseSummaries}
              onView={handleViewStudent}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudentTrigger}
              onAddNew={() => {
                setEditingStudentId(null)
                setShowStudentForm(true)
              }}
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
                  onNavigateToCourse={handleNavigateToCourse}
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                variant="outline"
              >
                السابق
              </Button>
              <div className="flex items-center gap-2">
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

        <section id="courses" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">لوحة الدورات</h2>
              <p className="text-sm text-muted-foreground">
                اختر دورة لمراجعة الحضور، إضافة أعذار، وتصفيتها حسب الطالب أو التاريخ.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                <BarChart3 size={14} />
                {courses.length} دورات مفعّلة
              </span>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setCourseDate(new Date().toISOString().split("T")[0])}
              >
                تسجيل حضور اليوم
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => document.getElementById("students")?.scrollIntoView({ behavior: "smooth" })}
              >
                تعديل الحضور
              </Button>
            </div>
          </div>

          <CoursesTable
            courses={courses}
            onView={(id) => handleNavigateToCourse(id, true)}
            onEdit={(course) => {
              setEditingCourse(course)
              setShowCourseForm(true)
            }}
            onDelete={(course) => setCourseToDelete(course)}
            onAddNew={() => {
              setEditingCourse(null)
              setShowCourseForm(true)
            }}
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={(id) => handleNavigateToCourse(id, true)}
                isActive={course.id === activeCourseId}
              />
            ))}
          </div>

          {activeCourse && (
            <div className="rounded-2xl border border-border/60 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{activeCourse.name}</p>
                <p className="text-xs text-muted-foreground">
                  {activeCourse.schedule} • {activeCourse.location} • الشيخ {activeCourse.instructor || DEFAULT_SHEIKH}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">
                      الطلاب: {activeCourse.studentIds.length}
                    </span>
                    <span className="rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">
                      متوسط الحضور: {activeCourse.averageAttendance}%
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800">
                      مسار: {activeCourse.focus}
                    </span>
                  </div>
                </div>
                <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    type="text"
                    value={courseStudentSearch}
                    onChange={(e) => setCourseStudentSearch(e.target.value)}
                    placeholder="ابحث داخل الدورة"
                  />
                  <select
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                    value={courseStatusFilter}
                    onChange={(e) => setCourseStatusFilter(e.target.value as typeof courseStatusFilter)}
                  >
                    <option value="all">كل الحالات</option>
                    <option value="present">حاضر</option>
                    <option value="absent">غياب</option>
                    <option value="excused">عذر</option>
                  </select>
                  <Input type="date" value={courseDate} onChange={(e) => setCourseDate(e.target.value)} />
                </div>
              </div>

              <div className="mt-4 divide-y divide-border rounded-xl border border-border/70 bg-white/70">
                {filteredCourseStudents.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">لا يوجد طلاب مطابقون للتصفية.</p>
                )}
                {filteredCourseStudents.map((student) => {
                  const record = student.attendance?.[courseDate]
                  return (
                    <div key={student.id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {record?.status
                            ? `آخر حالة: ${record.status === "H" ? "حاضر" : record.status === "G" ? "غياب" : "عذر"}`
                            : "لم يُسجل حضور في هذا التاريخ"}
                        </p>
                      </div>
                      <AttendanceStatusButton
                        status={record?.status || null}
                        onStatusChange={(status, reason) => updateAttendance(student.id, courseDate, status, reason)}
                        date={courseDate}
                        currentReason={record?.reason}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      <CourseForm
        open={showCourseForm}
        onClose={() => {
          setShowCourseForm(false)
          setEditingCourse(null)
        }}
        onSubmit={handleCourseSubmit}
        initialData={editingCourse || undefined}
      />

      <StudentForm
        open={showStudentForm}
        onClose={() => {
          setShowStudentForm(false)
          setEditingStudentId(null)
        }}
        onSubmit={handleStudentSubmit}
        initialData={editingStudent}
        initialMeta={editingStudentMeta}
        courses={courses}
      />

      {courseToDelete && (
        <Dialog open={!!courseToDelete} onClose={() => setCourseToDelete(null)} title="تأكيد حذف الدورة">
          <p className="text-sm text-muted-foreground mb-4">
            هل أنت متأكد من حذف الدورة <span className="font-semibold text-foreground">{courseToDelete.name}</span>؟
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCourseToDelete(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCourse}>
              حذف
            </Button>
          </div>
        </Dialog>
      )}

      {studentToDelete && (
        <DeleteConfirmModal
          isOpen={!!studentToDelete}
          studentName={studentToDelete.name}
          onConfirm={confirmDeleteStudent}
          onCancel={() => setStudentToDelete(null)}
        />
      )}

      {profileStudent && (
        <StudentDetailsModal
          isOpen={!!profileStudent}
          student={profileStudent}
          courseSummaries={studentCourseSummaries[profileStudent.id]}
          onNavigateToCourse={handleNavigateToCourse}
          onClose={() => setProfileStudent(null)}
        />
      )}

      {showCourseDetails && activeCourse && (
        <Dialog open={showCourseDetails} onClose={() => setShowCourseDetails(false)} title={activeCourse.name}>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{activeCourse.description || "لا يوجد وصف"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p>الشيخ: {activeCourse.instructor || DEFAULT_SHEIKH}</p>
              <p>الجدول: {activeCourse.schedule || "—"}</p>
              <p>المستوى: {activeCourse.level || "—"}</p>
              <p>الموقع: {activeCourse.location || "—"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">الطلاب المسجلون ({activeCourse.studentIds.length})</p>
              <ul className="space-y-1 text-sm text-muted-foreground max-h-48 overflow-auto">
                {studentsWithCourses
                  .filter((s) => s.courses?.includes(activeCourse.id))
                  .map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2">
                      <span>{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.phone || "—"}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Dialog>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-muted-foreground shadow-lg">
            جاري تحديث البيانات...
          </div>
        </div>
      )}
    </div>
  )
}

export default function CoursesPage() {
  return (
    <AttendanceProvider>
      <CoursesContent />
    </AttendanceProvider>
  )
}

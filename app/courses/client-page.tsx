"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Users, Compass, Grid3x3, List, Search, Filter, NotebookPen, BarChart3, Gauge } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { StudentCard } from "@/components/student-card"
import { DateRangeSelector } from "@/components/date-range-selector"
import { StatisticsPanel } from "@/components/statistics-panel"
import { ExportButton } from "@/components/export-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AttendanceStatusButton } from "@/components/attendance-status-button"
import { buildCourseData, type CourseOverview, type StudentWithCourses } from "@/lib/course-data"
import { getAttendanceRecord } from "@/lib/storage"
import { CoursesTable } from "@/components/courses-table"
import { CourseForm } from "@/components/course-form"
import { StudentsTable } from "@/components/students-table"
import { StudentForm } from "@/components/student-form"
import { Dialog } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-provider"
import type { Student } from "@/lib/types"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { StudentDetailsModal } from "@/components/student-details-modal"
import { createPortal } from "react-dom"

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
      className={`relative w-full rounded-2xl border border-border/60 bg-white/80 p-4 text-start shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${isActive ? "ring-2 ring-primary/30 border-primary/50" : ""
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
        {course.course_type === "women" && (
          <span className="rounded-full bg-pink-100 px-2 py-1 text-[10px] font-semibold text-pink-800">للنساء فقط</span>
        )}
        {course.course_type === "private" && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-800">خاصة</span>
        )}
        {course.course_type === "public" && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-800">عامة</span>
        )}
      </div>
      <div className="mt-5 grid grid-cols-10 gap-3">
        {course.trend.map((session) => {
          const total = session.present + session.absent + session.excused || 1
          const height = Math.round(((session.present + session.excused * 0.5) / maxTrend) * 100)
          const rate = Math.round((session.present / total) * 100)

          return (
            <div
              key={session.date}
              className="flex flex-col items-center justify-end gap-2"
            >
              {/* Bar */}
              <div
                className="w-2 rounded-xl bg-gradient-to-t  from-emerald-300  via-emerald-400  to-emerald-600shadow-smtransition-all duration-300 hover:scale-110 hover:shadow-md
          "
                style={{ height: `${Math.max(20, height)}px` }}
                title={`نسبة الحضور: ${rate}%\nالغياب: ${session.absent}\nالأعذار: ${session.excused}`}
              />

              {/* Date label */}
              <span className="text-[11px] font-medium text-muted-foreground tracking-tight">
                {session.date.split("-").slice(1).join("/")}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-end">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          التفاصيل
        </Link>
      </div>
    </button>
  )
}

const CoursesContent = ({ initialActiveCourseId }: { initialActiveCourseId?: string }) => {
  const { data, updateAttendance, deleteStudent, addStudent, updateStudent, addCourse, updateCourse, deleteCourse } =
    useAttendance()
  const { pushToast } = useToast()
  const router = useRouter()
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
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showSuggestions, searchTerm]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterDate, setFilterDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "excused">("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "card">(() => {
    if (typeof window !== "undefined") {
      return ((localStorage.getItem("viewMode") as "list" | "card") || "card") as "list" | "card"
    }
    return "card"
  })
  const [currentPage, setCurrentPage] = useState(0)
  const [activeCourseId, setActiveCourseId] = useState<string | null>(initialActiveCourseId || null)
  const [courseStudentSearch, setCourseStudentSearch] = useState("")
  const [courseStatusFilter, setCourseStatusFilter] = useState<"all" | "present" | "absent" | "excused">("all")
  const [courseDate, setCourseDate] = useState(new Date().toISOString().split("T")[0])
  const [courseToDelete, setCourseToDelete] = useState<CourseOverview | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const itemsPerPage = 12

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", viewMode)
    }
  }, [viewMode])

  const baseCourses = useMemo(() => data.courses || [], [data.courses])
  const { courses, studentsWithCourses, studentCourseSummaries } = useMemo(
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
      const record = getAttendanceRecord(student, selectedDate)
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "present" && record?.status === "H") ||
        (statusFilter === "absent" && record?.status === "G") ||
        (statusFilter === "excused" && record?.status === "E")

      const matchesFilterDate = !filterDate || Boolean(getAttendanceRecord(student, filterDate))
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
      const record = getAttendanceRecord(student, courseDate, activeCourseId)
      const matchesStatus =
        courseStatusFilter === "all" ||
        (courseStatusFilter === "present" && record?.status === "H") ||
        (courseStatusFilter === "absent" && record?.status === "G") ||
        (courseStatusFilter === "excused" && record?.status === "E")

      return matchesSearch && matchesStatus
    })
  }, [courseStudents, courseStudentSearch, courseStatusFilter, courseDate])

  const courseAttendanceStats = useMemo(() => {
    if (!activeCourse) return { total: 0, present: 0, absent: 0, excused: 0 }
    const stats = courseStudents.reduce(
      (acc, student) => {
        const record = getAttendanceRecord(student, courseDate, activeCourseId)
        if (record?.status === "H") acc.present += 1
        else if (record?.status === "G") acc.absent += 1
        else if (record?.status === "E") acc.excused += 1
        return acc
      },
      { total: courseStudents.length, present: 0, absent: 0, excused: 0 },
    )
    return stats
  }, [activeCourse, courseStudents, courseDate])

  const handleNavigateToCourse = (courseId: string) => {
    setActiveCourseId(courseId)
    router.push(`/courses/${courseId}`)
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
      course_type: course.course_type || "public",
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
        total_debt: payload.debt,
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
        total_debt: payload.debt,
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
    <div className=" relative min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-4 md:p-8">
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
            <div className="w-full max-w-sm space-y-2">
              <label className="text-sm font-semibold text-foreground">بحث شامل</label>
              <div className="relative w-full">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-inner">
                  <Search size={16} className="text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCurrentPage(0);
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder="ابحث عن طالب او دورة..."
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-base"
                  />

                </div>
                {searchTerm.trim() && showSuggestions &&
                  createPortal(
                    <div
                      className="max-h-48 overflow-y-auto rounded-xl mt-5 w-full border border-border bg-white shadow-lg z-[9999]"
                      style={{
                        position: "absolute",
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                      }}
                    >
                      {studentsWithCourses
                        .filter(student =>
                          student.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                        )
                        .slice(0, 4)
                        .map(student => (
                          <div
                            key={student.id}
                            className="cursor-pointer px-4 py-2 hover:bg-primary/20"
                            onClick={() => {
                              setSearchTerm(student.name);
                              setCurrentPage(0);
                              setShowSuggestions(false);
                            }}
                          >

                          </div>
                        ))}
                      {studentsWithCourses.filter(student =>
                        student.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                      ).length === 0 && (
                          <div className="px-4 py-2 text-muted-foreground">لا توجد اقتراحات</div>
                        )}
                    </div>,
                    document.body
                  )
                }

              </div>
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
            onView={(id) => handleNavigateToCourse(id)}
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
                onSelect={(id) => handleNavigateToCourse(id)}
                isActive={course.id === activeCourseId}
              />
            ))}
          </div>

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

    </div>
  )
}

export default function CoursesPage({ initialActiveCourseId }: { initialActiveCourseId?: string } = {}) {
  return (
    <AttendanceProvider>
      <CoursesContent initialActiveCourseId={initialActiveCourseId} />
    </AttendanceProvider>
  )
}

"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Users, Search, Filter, Grid3x3, List, NotebookPen } from "lucide-react"
import Link from "next/link"

import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { StudentCard } from "@/components/student-card"
import { StatisticsPanel } from "@/components/statistics-panel"
import { DateRangeSelector } from "@/components/date-range-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudentsTable } from "@/components/students-table"
import { StudentForm } from "@/components/student-form"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { StudentDetailsModal } from "@/components/student-details-modal"
import { buildCourseData, type CourseOverview, type StudentWithCourses } from "@/lib/course-data"
import type { Student } from "@/lib/types"
import { useToast } from "@/components/ui/toast-provider"

const StudentsContent = () => {
  const { data, deleteStudent, updateStudent, addStudent, courses: coursesFromCtx } = useAttendance()
  const { pushToast } = useToast()
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
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [profileStudent, setProfileStudent] = useState<Student | null>(null)
  const [studentMeta, setStudentMeta] = useState<
    Record<
      string,
      { phone?: string; email?: string; notes?: string; courseIds?: string[]; age?: number; debt?: number; warnings?: number }
    >
  >({})

  const baseCourses = useMemo(() => coursesFromCtx || [], [coursesFromCtx])
  const { courses, studentsWithCourses, studentCourseSummaries } = useMemo(
    () => buildCourseData(data.students, baseCourses),
    [data.students, baseCourses],
  )

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

  const itemsPerPage = 12
  const paginatedStudents = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredStudents.slice(start, start + itemsPerPage)
  }, [filteredStudents, currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))

  const studentLookup = useMemo(
    () =>
      studentsWithCourses.reduce<Record<string, Student>>((acc, student) => {
        const meta = studentMeta[student.id] || {}
        acc[student.id] = { ...student, ...meta }
        return acc
      }, {}),
    [studentsWithCourses, studentMeta],
  )

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
        age: payload.age,
        debt: payload.debt,
        warnings: payload.warnings,
        courses: payload.courseIds,
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
        age: payload.age,
        debt: payload.debt,
        warnings: payload.warnings,
        courses: payload.courseIds,
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
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-md backdrop-blur"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                إدارة الطلاب
              </p>
              <h1 className="text-3xl font-black text-foreground leading-tight">قائمة الطلاب والمتابعة اليومية</h1>
              <p className="text-sm text-muted-foreground">
                ابحث وأضف وحرّر الطلاب، وربطهم بالدورات مع متابعة حالة الحضور والغياب.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                  إجمالي الطلاب: {data.students.length}
                </span>
                <Link href="/courses" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-primary underline underline-offset-4">
                  <NotebookPen size={14} />
                  الانتقال للدورات
                </Link>
              </div>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <label className="text-sm font-semibold text-foreground">بحث عن طالب</label>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-inner">
                <Search size={16} className="text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(0)
                  }}
                  placeholder="ابحث عن طالب..."
                  className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-base"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-border/60 bg-white/90 p-5 shadow-sm backdrop-blur space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">تاريخ الجلسة</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setCurrentPage(0)
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">تصفية بتاريخ مدخل</label>
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              <Button
                onClick={() => {
                  setEditingStudentId(null)
                  setShowStudentForm(true)
                }}
                className="gap-2"
              >
                <Users size={16} />
                إضافة طالب
              </Button>
            </div>
          </div>
        </div>

        <StatisticsPanel students={filteredStudents} startDate={startDate} endDate={endDate} />

        {viewMode === "list" && (
          <StudentsTable
            students={paginatedStudents}
            studentCourseSummaries={studentCourseSummaries}
            onView={(id) => {
              const s = studentLookup[id]
              if (s) setProfileStudent(s)
            }}
            onEdit={(id) => {
              setEditingStudentId(id)
              setShowStudentForm(true)
            }}
            onDelete={(id) => {
              const s = studentLookup[id]
              if (s) setStudentToDelete(s)
            }}
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
      </div>

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
          onClose={() => setProfileStudent(null)}
        />
      )}
    </div>
  )
}

export default function StudentsPage() {
  return (
    <AttendanceProvider>
      <StudentsContent />
    </AttendanceProvider>
  )
}

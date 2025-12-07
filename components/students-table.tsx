"use client"

import { useMemo } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"

import type { Student } from "@/lib/types"
import type { StudentCourseSummary } from "@/lib/course-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StudentsTableProps {
  students: Student[]
  studentCourseSummaries: Record<string, StudentCourseSummary[]>
  onView: (studentId: string) => void
  onEdit: (studentId: string) => void
  onDelete: (studentId: string) => void
  onAddNew: () => void
  search: string
  onSearchChange: (value: string) => void
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  studentCourseSummaries,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  search,
  onSearchChange,
}) => {
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return students.filter((student) => student.name.toLowerCase().includes(term))
  }, [students, search])

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">قائمة الطلاب</h3>
          <p className="text-sm text-muted-foreground">إدارة بيانات الطلاب وتوزيعهم على الدورات.</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-inner">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن طالب..."
              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
            />
          </div>
          <Button onClick={onAddNew}>إضافة طالب جديد</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="hidden grid-cols-[1.8fr,1fr,1fr,1fr,1fr] items-center gap-4 border-b border-border/60 bg-muted/50 px-4 py-3 text-sm font-semibold text-muted-foreground md:grid">
          <span>اسم الطالب</span>
          <span>الجوال</span>
          <span>عدد الدورات</span>
          <span>المستحقات</span>
          <span>الإنذارات</span>
          <span className="text-left">إجراءات</span>
        </div>
        <div className="divide-y divide-border/60">
          {filtered.map((student) => {
            const summaries = studentCourseSummaries[student.id] || []
            const coursesCount = summaries.length
            const warnings = student.warnings ?? 0
            const debt = student.debt ?? 0
             return (
              <div
                key={student.id}
                className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[1.8fr,1fr,1fr,1fr,1fr]"
              >
                <div>
                  <p className="text-base font-semibold text-foreground">{student.name}</p>
                  <p className="text-xs text-muted-foreground">المعرف: {student.id}</p>
                </div>
                <div className="text-sm font-semibold text-foreground">{student.phone || "—"}</div>
                <div className="text-sm font-semibold text-foreground">{coursesCount}</div>
                <div className="text-sm font-semibold text-foreground">{debt}</div>
                <div className="text-sm font-semibold text-foreground">{warnings}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(student.id)} className="gap-1">
                    <Eye size={14} />
                    عرض
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(student.id)} className="gap-1">
                    <Pencil size={14} />
                    تعديل
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(student.id)} className="gap-1">
                    <Trash2 size={14} />
                    حذف
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useMemo } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"

import type { CourseOverview } from "@/lib/course-data"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface CoursesTableProps {
  courses: CourseOverview[]
  onView: (courseId: string) => void
  onEdit: (course: CourseOverview) => void
  onDelete: (course: CourseOverview) => void
  onAddNew: () => void
}

export const CoursesTable: React.FC<CoursesTableProps> = ({ courses, onView, onEdit, onDelete, onAddNew }) => {
  const sorted = useMemo(() => courses.slice().sort((a, b) => a.name.localeCompare(b.name)), [courses])

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">قائمة الدورات</h3>
          <p className="text-sm text-muted-foreground">إدارة الدورات وإجمالي الحضور المرتبط بكل دورة.</p>
        </div>
        <Button onClick={onAddNew} className="self-start sm:self-auto">
          إضافة دورة جديدة
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="hidden grid-cols-[2fr,1fr,1fr,1fr] items-center gap-4 border-b border-border/60 bg-muted/50 px-4 py-3 text-sm font-semibold text-muted-foreground md:grid">
          <span>اسم الدورة</span>
          <span>عدد الطلاب</span>
          <span>نسبة الحضور</span>
          <span className="text-left">إجراءات</span>
        </div>
        <div className="divide-y divide-border/60">
          {sorted.map((course) => (
            <div
              key={course.id}
              className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[2fr,1fr,1fr,1fr]"
            >
              <div>
                <p className="text-base font-semibold text-foreground">{course.name}</p>
                <p className="text-xs text-muted-foreground">{course.focus}</p>
              </div>
              <div className="text-sm font-semibold text-foreground">{course.studentIds.length}</div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{course.averageAttendance}%</p>
                <Progress value={course.averageAttendance} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(course.id)} className="gap-1">
                  <Eye size={14} />
                  عرض
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(course)} className="gap-1">
                  <Pencil size={14} />
                  تعديل
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(course)} className="gap-1">
                  <Trash2 size={14} />
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

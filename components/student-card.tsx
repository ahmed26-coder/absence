"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import type { Student } from "@/lib/types"
import type { StudentCourseSummary } from "@/lib/course-data"
import { useAttendance } from "./attendance-context"
import { getStudentStats } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AttendanceStatusButton } from "./attendance-status-button"
import { Trash2, Edit2, Info } from "lucide-react"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { EditStudentModal } from "./edit-student-modal"
import { StudentDetailsModal } from "./student-details-modal"

interface StudentCardProps {
  student: Student
  selectedDate: string
  courseLabels?: Record<string, string>
  onNavigateToCourse?: (courseId: string) => void
  courseSummaries?: StudentCourseSummary[]
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  selectedDate,
  courseLabels,
  onNavigateToCourse,
  courseSummaries,
}) => {
  const { updateAttendance, deleteStudent } = useAttendance()
  const stats = getStudentStats(student, null, null)
  const record = student.attendance[selectedDate]

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getStatusDisplay = (status: string | null) => {
    if (status === "H") return "حاضر"
    if (status === "G") return "غياب"
    if (status === "E") return "عذر"
    return "-"
  }

  const getStatusBgColor = (status: string | null) => {
    if (status === "H") return "bg-green-100 text-green-800"
    if (status === "G") return "bg-red-100 text-red-800"
    if (status === "E") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const handleDelete = () => {
    deleteStudent(student.id)
    setShowDeleteConfirm(false)
  }

  const totalDays = stats.present + stats.absent + stats.excused
  const attendanceRate = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/80" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-foreground">{student.name}</h3>
            <div className="flex flex-wrap gap-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBgColor(
                  record?.status,
                )}`}
              >
                <span className="size-2 rounded-full bg-current opacity-80" />
                {getStatusDisplay(record?.status)}
              </span>
              {(student.courses || []).map((courseId) => (
                <button
                  key={courseId}
                  type="button"
                  onClick={() => onNavigateToCourse?.(courseId)}
                  className="rounded-full border border-border/70 bg-white/70 px-3 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                >
                  {courseLabels?.[courseId] || courseId}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setShowEditStudent(true)}
              className="text-blue-500 hover:text-blue-700"
              title="تعديل الطالب"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-700"
              title="حذف الطالب"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="relative mt-4 rounded-xl border border-border/60 bg-white/70 p-3">
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground">
            <div className="text-center">
              <p className="text-[11px]">حاضر</p>
              <p className="text-lg font-bold text-emerald-600">{stats.present}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px]">غياب</p>
              <p className="text-lg font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px]">عذر</p>
              <p className="text-lg font-bold text-amber-600">{stats.excused}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px]">نسبة الحضور</p>
              <p className="text-lg font-bold text-indigo-700">{attendanceRate}%</p>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={attendanceRate} />
          </div>
        </div>

        <div className="relative mt-4 space-y-3">
          <AttendanceStatusButton
            status={record?.status || null}
            onStatusChange={(status, reason) => updateAttendance(student.id, selectedDate, status, reason)}
            date={selectedDate}
            currentReason={record?.reason}
          />

          {record?.reason && (
            <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm text-amber-800">
              السبب: {record.reason}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={() => setShowDetails(true)} className="gap-1">
              <Info size={16} />
              ملف الحضور
            </Button>
            <p className="text-[11px] text-muted-foreground">أحدث تاريخ: {selectedDate}</p>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        studentName={student.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <EditStudentModal isOpen={showEditStudent} student={student} onClose={() => setShowEditStudent(false)} />
      <StudentDetailsModal
        isOpen={showDetails}
        student={student}
        courseSummaries={courseSummaries}
        onNavigateToCourse={onNavigateToCourse}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import type { AttendanceStatus, Student } from "@/lib/types"
import type { StudentCourseSummary } from "@/lib/course-data"
import { useAttendance } from "./attendance-context"
import { getStudentStats, getAttendanceRecord } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AttendanceStatusButton } from "./attendance-status-button"
import { Trash2, Edit2, Info } from "lucide-react"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { EditStudentModal } from "./edit-student-modal"
import { StudentDetailsModal } from "./student-details-modal"
import { updateAttendanceInSupabase } from "@/lib/supabase-storage"
import Link from "next/link"

interface StudentCardProps {
  student: Student
  selectedDate: string
  courseLabels?: Record<string, string>
  onNavigateToCourse?: (courseId: string) => void
  courseSummaries?: StudentCourseSummary[]
  currentCourseId?: string | null
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  selectedDate,
  courseLabels,
  onNavigateToCourse,
  courseSummaries,
  currentCourseId,
}) => {
  const { updateAttendance, deleteStudent } = useAttendance()
  const stats = getStudentStats(student, null, null, currentCourseId ?? null)
  const record = getAttendanceRecord(student, selectedDate, currentCourseId ?? null)
  const [reasonInput, setReasonInput] = useState("");
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getStatusDisplay = (status: string | null) => {
    if (status === "H") return "حاضر"
    if (status === "G") return "غياب"
    if (status === "E") return "عذر"
    return "-"
  }

  const handleStatusChange = async (
    status: AttendanceStatus | "E" | null,
    reason?: string
  ) => {
    if (status === "E" && !reason) {
      setIsReasonModalOpen(true);
      return;
    }
    setLoadingStatus(status as AttendanceStatus);
    // update local + server via context (include course when available)
    const courseId = currentCourseId || null
    updateAttendance(student.id, courseId, selectedDate, status, reason)

    try {
      await updateAttendanceInSupabase(student.id, courseId, selectedDate, status, reason)
    } catch (err) {
      console.error("خطأ في تحديث Supabase", err)
    }
    setLoadingStatus(null);
  };


  const getStatusBgColor = (status: string | null) => {
    if (status === "H") return "bg-green-100 text-green-800"
    if (status === "G") return "bg-red-100 text-red-800"
    if (status === "E") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }
  const getProgressColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800"
    if (status === "H") return "bg-emerald-600"
    if (status === "G") return "bg-red-600"
    if (status === "E") return "bg-amber-600"
    return "bg-gray-100 text-gray-800"
  }


  const handleDelete = () => {
    deleteStudent(student.id)
    setShowDeleteConfirm(false)
  }
  const [loadingStatus, setLoadingStatus] = useState<AttendanceStatus | null>(null);
  const totalDays = stats.present + stats.absent + stats.excused;
  const attendanceRate = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 0;
  const progressColor = getProgressColor(record?.status ?? null);

  // lock background scroll while the small reason modal is open
  useEffect(() => {
    if (!isReasonModalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev || ""
    }
  }, [isReasonModalOpen])


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/85 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/80" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-xl text-foreground">{student.name}</h3>
            <div className="flex flex-wrap gap-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBgColor(
                  record?.status ?? null,
                )}`}
              >
                <span className="size-2 rounded-full bg-current opacity-80" />
                {getStatusDisplay(record?.status ?? null)}
              </span>
              {(student.courses || []).map((courseId) => (
                <Link
                  key={courseId}
                  href={`/courses/${courseId}`}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {courseLabels?.[courseId] || courseId}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEditStudent(true)}
              className="gap-1 text-blue-600 hover:text-blue-700"
              title="تعديل الطالب"
            >
              <Edit2 size={16} />
              تعديل
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1"
              title="حذف الطالب"
            >
              <Trash2 size={16} />
              حذف
            </Button>
          </div>
        </div>

        <div className="relative mt-5 rounded-xl border border-border/60 bg-white/70 p-4">
          <div className="grid grid-cols-4 gap-3 text-xs font-semibold text-muted-foreground">
            <div className="text-center">
              <p className="text-[11px]">حاضر</p>
              <p className="text-lg font-bold text-emerald-600 leading-tight">{stats.present}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px]">غياب</p>
              <p className="text-lg font-bold text-red-600 leading-tight">{stats.absent}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px]">عذر</p>
              <p className="text-lg font-bold text-amber-600 leading-tight">{stats.excused}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px]">نسبة الحضور</p>
              <p className="text-lg font-bold text-indigo-700 leading-tight">{attendanceRate}%</p>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={attendanceRate} className={`${progressColor}`} />
          </div>
        </div>

        <div className="relative mt-5 space-y-3">
          <AttendanceStatusButton
            status={record?.status ?? null}
            isLoading={loadingStatus !== null}
            date={selectedDate}
            onStatusChange={handleStatusChange}
            currentReason={record?.reason}
          />

          {isReasonModalOpen && mounted && (
            <>
              {createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsReasonModalOpen(false)}>
                  <div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-xl space-y-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold">سبب الغياب</h3>

                    <input
                      value={reasonInput}
                      onChange={(e) => setReasonInput(e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="اكتب السبب هنا..."
                    />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsReasonModalOpen(false)}>
                        إلغاء
                      </Button>

                      <Button
                        onClick={() => {
                          // تحديث فوراً عند الضغط على "تم"
                          const courseId = currentCourseId || null
                          updateAttendance(student.id, courseId, selectedDate, "E", reasonInput)

                          // إرسال التحديث للسيرفر
                          updateAttendanceInSupabase(student.id, courseId, selectedDate, "E", reasonInput)
                            .then((success) => {
                              if (!success) console.error("فشل تحديث الغياب مع السبب على Supabase");
                            })
                            .catch(console.error);

                          setIsReasonModalOpen(false);
                          setReasonInput("");
                        }}
                      >
                        تم
                      </Button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </>
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

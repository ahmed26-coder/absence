"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

import type { Student } from "@/lib/types"
import type { StudentCourseSummary } from "@/lib/course-data"
import { getStudentStats } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EditAttendanceModal } from "./edit-attendance-modal"
import Link from "next/link"


interface StudentDetailsModalProps {
  isOpen: boolean
  student: Student
  courseSummaries?: StudentCourseSummary[]
  onNavigateToCourse?: (courseId: string) => void
  onClose: () => void
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  student,
  onClose,
  courseSummaries,
  onNavigateToCourse,
}) => {
  const [showEditAttendance, setShowEditAttendance] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const stats = getStudentStats(student)

  // mount check for portal hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // lock background scroll while this modal is open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev || ""
    }
  }, [isOpen])

  const getStatusDisplay = (status: string | null) => {
    if (status === "H") return "حاضر"
    if (status === "G") return "غياب"
    if (status === "E") return "عذر"
    return "-"
  }

  const getStatusColor = (status: string | null) => {
    if (status === "H") return "bg-green-100 text-green-800"
    if (status === "G") return "bg-red-100 text-red-800"
    if (status === "E") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  // flatten attendance across courses to a list of [date, record]
  const attendanceRecords = Object.entries(student.attendance || {})
    .flatMap(([courseId, recs]) => Object.entries(recs || {}).map(([date, rec]) => [date, rec] as [string, any]))
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, 30)

  const handleEditClick = (date: string) => {
    setSelectedDate(date)
    setShowEditAttendance(true)
  }

  if (!isOpen || !mounted) return null

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
          <div className="bg-white rounded-2xl p-6 md:p-7 mx-auto w-[90vh] max-w-3xl shadow-lg max-h-[80vh] scrollbar-custom overflow-y-auto space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">سجل الحضور - {student.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  عرض ملف الحضور، الدورات المسجل بها، وأحدث الجلسات
                </p>
              </div>
              <Button type="button" variant="outline" onClick={onClose}>
                إغلاق
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">عدد الدورات</p>
                <p className="text-lg font-semibold text-foreground">{courseSummaries?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">نسبة الحضور الإجمالية</p>
                <p className="text-lg font-semibold text-foreground">
                  {stats.presentPercentage}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">أحدث جلسة</p>
                <p className="text-lg font-semibold text-foreground">
                  {attendanceRecords[0]?.[0] || Object.keys(student.attendance || {}).flatMap(k => Object.keys(student.attendance[k] || {})).sort().slice(-1)[0] || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border/60 bg-white/70 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">العمر</p>
                <p className="text-sm font-semibold text-foreground">{student.age ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">المستحقات المالية</p>
                <p className="text-sm font-semibold text-foreground">{student.total_debt ?? 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">عدد الإنذارات</p>
                <p className="text-sm font-semibold text-foreground">{student.warnings ?? 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">الهاتف</p>
                <p className="text-sm font-semibold text-foreground">{student.phone || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                <p className="text-sm font-semibold text-foreground break-words">{student.email || "—"}</p>
              </div>
              <div className="space-y-1 sm:col-span-3">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="text-sm text-foreground leading-relaxed">{student.notes || "—"}</p>
              </div>
            </div>

            {courseSummaries && courseSummaries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">الدورات الملتحق بها</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courseSummaries.map((course) => (
                    <div
                      key={course.courseId}
                      className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/70 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{course.courseName}</p>
                          <p className="text-xs text-muted-foreground">
                            جلسات مسجلة: {course.totalSessions || "—"}
                          </p>
                        </div>
                        <Link href={`/courses/${course.courseId}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            الذهاب للدورة
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-2 space-y-1">
                        <Progress value={course.attendanceRate} className="h-2" />
                        <p className="text-[11px] text-muted-foreground">
                          نسبة الحضور: {course.attendanceRate}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">سجل الجلسات الأخيرة</h3>
              {attendanceRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">لا توجد سجلات حضور</p>
              ) : (
                <div className="space-y-2">
                  {attendanceRecords.map(([date, record]) => (
                    <div
                      key={date}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{date}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2.5 py-1 rounded text-sm ${getStatusColor(record.status)}`}>
                            {getStatusDisplay(record.status)}
                          </span>
                          {record.reason && <span className="text-xs text-gray-600">السبب: {record.reason}</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(date)}>
                        تعديل
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedDate && (
        <EditAttendanceModal
          isOpen={showEditAttendance}
          student={student}
          date={selectedDate}
          onClose={() => {
            setShowEditAttendance(false)
            setSelectedDate(null)
          }}
        />
      )}
    </>
  )
}

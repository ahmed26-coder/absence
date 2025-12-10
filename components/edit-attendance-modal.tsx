"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import type { AttendanceStatus, Student } from "@/lib/types"
import { getAttendanceRecord } from "@/lib/storage"
import { useAttendance } from "./attendance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditAttendanceModalProps {
  isOpen: boolean
  student: Student
  date: string
  courseId?: string | null
  onClose: () => void
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ isOpen, student, date, onClose, courseId }) => {
  const { updateAttendance } = useAttendance()
  const record = getAttendanceRecord(student, date, courseId ?? null)
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || null)
  const [reason, setReason] = useState(record?.reason || "")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(record?.status || null)
    setReason(record?.reason || "")
  }, [record, date])

  // lock background scroll while this modal is open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev || ""
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // no explicit course passed here; update under null/global
    updateAttendance(student.id, null, date, status, status === "E" ? reason : undefined)
    onClose()
  }

  const handleCancel = () => {
    setStatus(record?.status || null)
    setReason(record?.reason || "")
    onClose()
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">تعديل الحضور</h2>
        <p className="text-sm text-gray-600 mb-4">
          {student.name} - {date}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">الحالة</label>
            <div className="flex gap-2">
              <Button
                type="button"
                className={`flex-1 ${status === "H" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                onClick={() => setStatus("H")}
              >
                حاضر
              </Button>
              <Button
                type="button"
                className={`flex-1 ${status === "G" ? "bg-red-500 text-white" : "bg-gray-200"}`}
                onClick={() => setStatus("G")}
              >
                غياب
              </Button>
              <Button
                type="button"
                className={`flex-1 ${status === "E" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}
                onClick={() => setStatus("E")}
              >
                عذر
              </Button>
            </div>
          </div>

          {status === "E" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">سبب الغياب</label>
              <Input
                type="text"
                placeholder="أدخل سبب الغياب"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

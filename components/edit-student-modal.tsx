"use client"

import { useState } from "react"
import type { Student, AttendanceStatus } from "@/lib/types"
import { useAttendance } from "./attendance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStudentStats } from "@/lib/storage"

interface EditStudentModalProps {
  isOpen: boolean
  student: Student
  onClose: () => void
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, student, onClose }) => {
  const [name, setName] = useState(student.name)
  const today = new Date().toISOString().split("T")[0] // yyyy-mm-dd
  const currentAttendance = student.attendance?.[today] || { status: "", reason: "" }
  const [status, setStatus] = useState<AttendanceStatus | "">(currentAttendance.status as AttendanceStatus | "")
  const [reason, setReason] = useState(currentAttendance.reason || "")
  const { updateStudent, updateAttendance } = useAttendance()

  const stats = getStudentStats(student)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && name !== student.name) {
      updateStudent(student.id, name)
    }
    if (status) {
      updateAttendance(student.id, today, status as AttendanceStatus, reason || undefined)
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-center mb-2">تعديل بيانات الطالب</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block mb-1">اسم الطالب</Label>
            <Input
              type="text"
              placeholder="اسم الطالب"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label className="block mb-1">حالة اليوم ({today})</Label>
            <div className="flex gap-3">
              {[
                { value: "H", label: "حاضر" },
                { value: "G", label: "غياب" },
                { value: "E", label: " عذر" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value as AttendanceStatus)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          {status === "E" && (
            <div>
              <Label className="block mb-1">سبب العذر</Label>
              <Input
                type="text"
                placeholder="مثلاً: مرض - سفر - ظرف عائلي"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
          <div className="border-t pt-3 text-md font-medium text-gray-700">
            <p>إجمالي الأيام المسجلة: {stats.present + stats.absent + stats.excused}</p>
            <p>الحضور: {stats.present}</p>
            <p>الغياب: {stats.absent}</p>
            <p>الأعذار: {stats.excused}</p>
          </div>

          {/* الأزرار */}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">حفظ التعديلات</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

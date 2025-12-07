"use client"

import type React from "react"
import { useState } from "react"

import { useAttendance } from "./attendance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-provider"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("")
  const [courseId, setCourseId] = useState<string>("")
  const { addStudent, courses } = useAttendance()
  const { pushToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !courseId) {
      pushToast(courseId ? "أدخل اسم الطالب" : "يجب تسجيل الطالب في دورة واحدة على الأقل", "error")
      return
    }
    const created = await addStudent({ name: name.trim(), courses: [courseId] })
    if (created) {
      pushToast("تمت إضافة الطالب بنجاح", "success")
      setName("")
      setCourseId("")
      onClose()
    } else {
      pushToast("تعذّر إضافة الطالب", "error")
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} title="إضافة طالب جديد" description="أدخل اسم الطالب ثم احفظ.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="اسم الطالب"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="space-y-2">
          <label className="form-label">الدورة</label>
          <select
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">اختر دورة</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!name.trim() || !courseId}>
            إضافة
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

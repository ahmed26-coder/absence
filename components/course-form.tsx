"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react"

import type { CourseOverview } from "@/lib/course-data"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"

const DEFAULT_SHEIKH = "الشيخ عمرو بن أبي الفتوح"

interface CourseFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: CourseOverview & { description?: string; notes?: string }) => void
  initialData?: Partial<CourseOverview> & { description?: string; notes?: string }
}

export const CourseForm: React.FC<CourseFormProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || "")
  const [instructor, setInstructor] = useState(initialData?.instructor || DEFAULT_SHEIKH)
  const [focus, setFocus] = useState(initialData?.focus || "")
  const [location, setLocation] = useState(initialData?.location || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [schedule, setSchedule] = useState(initialData?.schedule || "")
  const [level, setLevel] = useState(initialData?.level || "")
  const [type, setType] = useState(initialData?.course_type || "public")
  const [isLoading, setIsLoading] = useState(false)

  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);


  useEffect(() => {
    if (!open) return
    setName(initialData?.name || "")
    setInstructor(initialData?.instructor || DEFAULT_SHEIKH)
    setFocus(initialData?.focus || "")
    setLocation(initialData?.location || "")
    setDescription(initialData?.description || "")
    setNotes(initialData?.notes || "")
    setSchedule(initialData?.schedule || "")
    setLevel(initialData?.level || "")
    setType(initialData?.course_type || "public")
  }, [initialData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      onSubmit({
        id: initialData?.id || crypto.randomUUID(),
        name: name.trim(),
        instructor: instructor.trim() || DEFAULT_SHEIKH,
        focus: focus.trim() || "—",
        location: location.trim() || "—",
        color: initialData?.color || "emerald",
        studentIds: initialData?.studentIds || [],
        averageAttendance: initialData?.averageAttendance || 0,
        schedule: schedule.trim() || "",
        level: level.trim() || "",
        description: description.trim(),
        notes: notes.trim(),
        course_type: type,
        trend: initialData?.trend || [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل الدورة" : "إضافة دورة جديدة"}
      description="أدخل بيانات الدورة واحفظ التغييرات."
    >
      <div className="max-w-lg w-full max-h-[60vh] md:max-h-[70vh] overflow-y-auto px-1 py-4 scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="form-label">اسم الدورة *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: التجويد المتقدم" disabled={isLoading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="form-label">الشيخ المشرف</label>
              <Input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder={DEFAULT_SHEIKH}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">الموقع</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="مثال: قاعة الحديث" disabled={isLoading} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="form-label">الجدول</label>
              <Input
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="مثال: يومي / أسبوعي"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">المستوى</label>
              <Input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="مثال: مبتدئ / متوسط / متقدم"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="form-label">وصف مختصر / محور الدورة</label>
              <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="مثال: أحكام التجويد" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label className="form-label">نوع الدورة *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="public">عامة</option>
                <option value="private">خاصة</option>
                <option value="women">للنساء فقط</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="form-label">الوصف التفصيلي</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ملاحظات إضافية عن محتوى الدورة"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="form-label">ملاحظات</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات داخلية" disabled={isLoading} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <LoadingButton type="submit" isLoading={isLoading} loadingText={isEdit ? "جاري الحفظ..." : "جاري الإضافة..."} disabled={!name.trim()}>
              {isEdit ? "حفظ التعديلات" : "إضافة الدورة"}
            </LoadingButton>
          </div>
        </form>
      </div >
    </Dialog >
  )
}


"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react"

import type { Student } from "@/lib/types"
import type { CourseOverview } from "@/lib/course-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"

interface StudentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: {
    id?: string
    name: string
    phone?: string
    email?: string
    notes?: string
    age?: number
    debt?: number
    warnings?: number
    courseIds: string[]
  }) => void
  initialData?: Student
  initialMeta?: {
    phone?: string
    email?: string
    notes?: string
    age?: number
    debt?: number
    warnings?: number
    courseIds?: string[]
  }
  courses: CourseOverview[]
}

export const StudentForm: React.FC<StudentFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  initialMeta,
  courses,
}) => {
  const [name, setName] = useState(initialData?.name || "")
  const [phone, setPhone] = useState(initialMeta?.phone || "")
  const [email, setEmail] = useState(initialMeta?.email || "")
  const [notes, setNotes] = useState(initialMeta?.notes || "")
  const [age, setAge] = useState<number | undefined>(initialMeta?.age ?? initialData?.age)
  const [debt, setDebt] = useState<number | undefined>(initialMeta?.debt ?? initialData?.debt)
  const [warnings, setWarnings] = useState<number | undefined>(initialMeta?.warnings ?? initialData?.warnings)
  const [courseIds, setCourseIds] = useState<string[]>(initialMeta?.courseIds || initialData?.courses || [])
  const [courseError, setCourseError] = useState<string | null>(null)

  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (!open) return;
    const merged = {
      ...initialData,
      ...initialMeta
    };

    setName(merged.name || "");
    setPhone(merged.phone || "");
    setEmail(merged.email || "");
    setNotes(merged.notes || "");
    setAge(merged.age);
    setDebt(merged.debt);
    setWarnings(merged.warnings);
    setCourseIds(merged.courses || merged.courseIds || []);
    setCourseError(null);
  }, [initialData, initialMeta, open]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!courseIds.length) {
      setCourseError("يجب تسجيل الطالب في دورة واحدة على الأقل")
      return
    }
    onSubmit({
      id: initialData?.id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      age,
      debt,
      warnings,
      courseIds,
    })
  }

  const courseOptions = useMemo(() => courses, [courses])

  const toggleCourse = (id: string) => {
    setCourseIds((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      if (next.length) setCourseError(null)
      return next
    })
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
      description="أدخل بيانات الطالب واختر الدورات المنضم إليها."
    >
      <div className="md:max-w-xl max-w-lg w-full max-h-[60vh] md:max-h-[70vh] overflow-y-auto px-1 py-4 scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="form-label">اسم الطالب *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="اسم الطالب" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="form-label">العمر</label>
              <Input
                type="number"
                value={age ?? ""}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="مثال: 20"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">عدد الإنذارات</label>
              <Input
                type="number"
                value={warnings ?? ""}
                onChange={(e) => setWarnings(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                min={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="form-label">رقم الجوال</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="form-label">المستحقات المالية</label>
              <Input
                type="number"
                value={debt ?? ""}
                onChange={(e) => setDebt(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                min={0}
                step="0.1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="form-label">البريد الإلكتروني</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
            </div>
            <div className="space-y-2">
              <label className="form-label">ملاحظات</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات داخلية" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="form-label">إسناد إلى دورات *</label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/40 p-3">
              {courseOptions.map((course) => {
                const selected = courseIds.includes(course.id)
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white text-muted-foreground hover:border-primary/50"
                      }`}
                  >
                    {course.name}
                  </button>
                )
              })}
            </div>
            {courseError && <p className="text-xs font-semibold text-red-600">{courseError}</p>}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEdit ? "حفظ التعديلات" : "إضافة الطالب"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
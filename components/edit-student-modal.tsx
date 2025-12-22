"use client"

import { useEffect, useMemo, useState } from "react"
import type { Student, AttendanceStatus } from "@/lib/types"
import { useAttendance } from "./attendance-context"
import { LoadingButton } from "@/components/ui/loading-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStudentStats, getAttendanceRecord } from "@/lib/storage"
import { Dialog } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast-provider"

interface EditStudentModalProps {
  isOpen: boolean
  student: Student
  onClose: () => void
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, student, onClose }) => {
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const currentAttendance = getAttendanceRecord(student, today) || { status: "", reason: "" }

  const [name, setName] = useState(student.name)
  const [age, setAge] = useState<string>(student.age ? String(student.age) : "")
  const [phone, setPhone] = useState(student.phone || "")
  const [email, setEmail] = useState(student.email || "")
  const [debt, setDebt] = useState<string>(student.total_debt !== undefined ? String(student.total_debt) : "")
  const [warnings, setWarnings] = useState<string>(student.warnings !== undefined ? String(student.warnings) : "0")
  const [notes, setNotes] = useState(student.notes || "")
  const [status, setStatus] = useState<AttendanceStatus | "">(currentAttendance.status as AttendanceStatus | "")
  const [reason, setReason] = useState(currentAttendance.reason || "")
  const [courses, setCourses] = useState<string[]>(student.courses || [])
  const [submitting, setSubmitting] = useState(false)
  const { updateStudent, updateAttendance, data } = useAttendance()
  const { pushToast } = useToast()

  const stats = getStudentStats(student)

  useEffect(() => {
    if (!isOpen) return
    setName(student.name)
    setAge(student.age ? String(student.age) : "")
    setPhone(student.phone || "")
    setEmail(student.email || "")
    setDebt(student.total_debt !== undefined ? String(student.total_debt) : "")
    setWarnings(student.warnings !== undefined ? String(student.warnings) : "0")
    setNotes(student.notes || "")
    setCourses(student.courses || [])
    const attendance = getAttendanceRecord(student, today) || { status: "", reason: "" }
    setStatus(attendance.status as AttendanceStatus | "")
    setReason(attendance.reason || "")
  }, [isOpen, student, today])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      pushToast("يرجى إدخال اسم الطالب", "error")
      return
    }

    if (!courses.length) {
      pushToast("يجب تسجيل الطالب في دورة واحدة على الأقل", "error")
      return
    }

    setSubmitting(true)
    try {
      const ageValue = age ? Number(age) : undefined
      const debtValue = debt !== "" ? Number(debt) : undefined
      const warningsValue = warnings !== "" ? Number(warnings) : undefined

      await updateStudent(student.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        age: Number.isNaN(ageValue) ? undefined : ageValue,
        total_debt: Number.isNaN(debtValue) ? undefined : debtValue,
        warnings: Number.isNaN(warningsValue) ? undefined : warningsValue,
        notes: notes.trim() || undefined,
        courses,
      })

      if (status) {
        // no course specified in student dialog: update global/null course
        await updateAttendance(student.id, null, today, status as AttendanceStatus, reason || undefined)
      }

      pushToast("تم حفظ بيانات الطالب", "success")
      onClose()
    } catch (error) {
      console.error("Error updating student", error)
      pushToast("تعذر حفظ التعديلات", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!submitting) onClose()
      }}
      title="تعديل بيانات الطالب"
      description="حرر بيانات التواصل والبيانات المالية وسجل الحضور لليوم."
      className="max-w-2xl"
    >
      <div className="md:max-w-xl max-w-lg w-full max-h-[60vh] md:max-h-[70vh] overflow-y-auto px-1 py-4 scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>اسم الطالب</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="اسم الطالب" />
            </div>
            <div className="space-y-1.5">
              <Label>رقم الجوال</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label>البريد الإلكتروني</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label>العمر</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="مثال: 18" />
            </div>
            <div className="space-y-1.5">
              <Label>المستحقات المالية</Label>
              <Input
                type="number"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
                placeholder="القيمة بالريال"
              />
            </div>
            <div className="space-y-1.5">
              <Label>الإنذارات</Label>
              <Input
                type="number"
                value={warnings}
                min={0}
                onChange={(e) => setWarnings(e.target.value)}
                placeholder="عدد الإنذارات"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>ملاحظات</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات داخلية" />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/40 p-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              حالة اليوم ({today})
              <span className="text-xs text-muted-foreground">سجّل حالة الطالب لهذا التاريخ</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "H", label: "حاضر", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { value: "G", label: "غياب", tone: "bg-red-50 text-red-700 border-red-200" },
                { value: "E", label: "عذر", tone: "bg-amber-50 text-amber-700 border-amber-200" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value as AttendanceStatus)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${status === opt.value ? `${opt.tone} ring-2 ring-offset-1` : "bg-white text-muted-foreground"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {status === "E" && (
              <div className="space-y-1.5">
                <Label>سبب العذر</Label>
                <Input
                  type="text"
                  placeholder="مثلاً: مرض - سفر - ظرف عائلي"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-border/60 bg-white/70 p-3 text-sm text-muted-foreground sm:grid-cols-3">
            <p>إجمالي الأيام المسجلة: {stats.present + stats.absent + stats.excused}</p>
            <p>الحضور: {stats.present}</p>
            <p>الغياب: {stats.absent}</p>
            <p>الأعذار: {stats.excused}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">الدورات المشتركة</Label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/40 p-3">
              {data.courses.map((course) => {
                const selected = courses.includes(course.id)
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => {
                      setCourses((prev) =>
                        prev.includes(course.id) ? prev.filter((c) => c !== course.id) : [...prev, course.id]
                      )
                    }}
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
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              إلغاء
            </Button>
            <LoadingButton type="submit" isLoading={submitting} loadingText="جاري الحفظ...">
              حفظ التعديلات
            </LoadingButton>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

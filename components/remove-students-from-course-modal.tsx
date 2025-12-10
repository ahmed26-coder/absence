"use client"

import { useState, useMemo } from "react"
import type { Student } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-provider"

interface RemoveStudentsFromCourseModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseName: string
  allStudents: Student[]
  enrolledStudentIds: string[]
  onRemoveStudents: (studentIds: string[]) => Promise<boolean>
}

export const RemoveStudentsFromCourseModal: React.FC<RemoveStudentsFromCourseModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  allStudents,
  enrolledStudentIds,
  onRemoveStudents,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { pushToast } = useToast()

  const enrolledStudents = useMemo(() => {
    return allStudents.filter((s) => enrolledStudentIds.includes(s.id))
  }, [allStudents, enrolledStudentIds])

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return enrolledStudents.filter((s) => s.name.toLowerCase().includes(term))
  }, [enrolledStudents, searchTerm])

  const handleToggleStudent = (studentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)))
    }
  }

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      pushToast("يرجى اختيار طالب واحد على الأقل", "error")
      return
    }

    setIsLoading(true)
    try {
      const success = await onRemoveStudents(Array.from(selectedIds))
      if (success) {
        pushToast(`تمت إزالة ${selectedIds.size} طالب(ة) بنجاح`, "success")
        setSelectedIds(new Set())
        setSearchTerm("")
        onClose()
      } else {
        pushToast("تعذر إزالة الطلاب", "error")
      }
    } catch (error) {
      console.error("Error removing students:", error)
      pushToast("حدث خطأ أثناء إزالة الطلاب", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isLoading) onClose()
      }}
      title="حذف طالب من الدورة"
      description={`أزل طلاباً من دورة ${courseName}`}
    >
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label className="form-label">ابحث عن طالب</label>
          <Input
            type="text"
            placeholder="اكتب اسم الطالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {filteredStudents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">الطلاب المسجلون</label>
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={isLoading}
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {selectedIds.size === filteredStudents.length ? "إلغاء التحديد" : "تحديد الكل"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-white/70 p-3 space-y-2">
              {filteredStudents.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground">{student.name}</span>
                </label>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              تم تحديد {selectedIds.size} من {filteredStudents.length}
            </p>
          </div>
        )}

        {filteredStudents.length === 0 && !searchTerm && (
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">لا يوجد أي طالب مسجل في هذه الدورة.</p>
          </div>
        )}

        {filteredStudents.length === 0 && searchTerm && (
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">لا توجد نتائج تطابق البحث.</p>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!isLoading) {
                setSelectedIds(new Set())
                setSearchTerm("")
                onClose()
              }
            }}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <LoadingButton
            isLoading={isLoading}
            loadingText="جاري الحذف..."
            onClick={handleSubmit}
            disabled={selectedIds.size === 0}
            variant="destructive"
          >
            حذف ({selectedIds.size})
          </LoadingButton>
        </div>
      </div>
    </Dialog>
  )
}

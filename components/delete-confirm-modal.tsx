"use client"

import type React from "react"
import { Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

interface DeleteConfirmModalProps {
  isOpen: boolean
  studentName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  studentName,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="max-w-sm">
      <div className="space-y-4" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive">
            <TriangleAlert size={20} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-destructive">تأكيد الحذف</h2>
        </div>
        <p className="text-foreground">
          هل أنت متأكد من حذف الطالب <span className="font-bold">{studentName}</span>؟
        </p>
        <p className="text-sm text-muted-foreground">سيتم حذف جميع سجلات الحضور الخاصة به أيضاً.</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            إلغاء
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting} aria-busy={isDeleting} className="gap-2">
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

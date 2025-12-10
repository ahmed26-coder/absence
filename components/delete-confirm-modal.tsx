"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"

interface DeleteConfirmModalProps {
  isOpen: boolean
  studentName: string
  onConfirm: () => void
  onCancel: () => void
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, studentName, onConfirm, onCancel }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // lock background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev || ""
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-red-600">تأكيد الحذف</h2>
        <p className="text-gray-700 mb-6">
          هل أنت متأكد من حذف الطالب <span className="font-bold">{studentName}</span>؟
        </p>
        <p className="text-sm text-gray-500 mb-6">سيتم حذف جميع سجلات الحضور الخاصة به أيضاً.</p>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            حذف
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

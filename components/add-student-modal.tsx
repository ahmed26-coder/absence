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
  const { addStudent } = useAttendance()
  const { pushToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const created = await addStudent(name.trim())
    if (created) {
      pushToast("تمت إضافة الطالب بنجاح", "success")
      setName("")
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
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            إضافة
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

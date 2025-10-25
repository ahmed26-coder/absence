"use client"

import type React from "react"
import { useState } from "react"
import { useAttendance } from "./attendance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("")
  const { addStudent } = useAttendance()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      addStudent(name)
      setName("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">إضافة طالب جديد</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="اسم الطالب"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit">إضافة</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

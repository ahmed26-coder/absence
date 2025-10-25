"use client"

import type React from "react"
import { useState } from "react"
import type { Student } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { EditAttendanceModal } from "./edit-attendance-modal"

interface StudentDetailsModalProps {
  isOpen: boolean
  student: Student
  onClose: () => void
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, student, onClose }) => {
  const [showEditAttendance, setShowEditAttendance] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getStatusDisplay = (status: string | null) => {
    if (status === "H") return "حاضر"
    if (status === "G") return "غياب"
    if (status === "E") return "عذر"
    return "-"
  }

  const getStatusColor = (status: string | null) => {
    if (status === "H") return "bg-green-100 text-green-800"
    if (status === "G") return "bg-red-100 text-red-800"
    if (status === "E") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const attendanceRecords = Object.entries(student.attendance)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .slice(0, 30)

  const handleEditClick = (date: string) => {
    setSelectedDate(date)
    setShowEditAttendance(true)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-96 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">سجل الحضور - {student.name}</h2>

          {attendanceRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد سجلات حضور</p>
          ) : (
            <div className="space-y-2">
              {attendanceRecords.map(([date, record]) => (
                <div
                  key={date}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{date}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(record.status)}`}>
                        {getStatusDisplay(record.status)}
                      </span>
                      {record.reason && <span className="text-xs text-gray-600">السبب: {record.reason}</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(date)}>
                    تعديل
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      </div>

      {selectedDate && (
        <EditAttendanceModal
          isOpen={showEditAttendance}
          student={student}
          date={selectedDate}
          onClose={() => {
            setShowEditAttendance(false)
            setSelectedDate(null)
          }}
        />
      )}
    </>
  )
}

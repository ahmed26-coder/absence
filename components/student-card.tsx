"use client"

import type React from "react"
import { useState } from "react"
import type { Student } from "@/lib/types"
import { useAttendance } from "./attendance-context"
import { getStudentStats } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { AttendanceStatusButton } from "./attendance-status-button"
import { Trash2, Edit2, Info } from "lucide-react"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { EditStudentModal } from "./edit-student-modal"
import { StudentDetailsModal } from "./student-details-modal"

interface StudentCardProps {
  student: Student
  selectedDate: string
  startDate: string | null
  endDate: string | null
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, selectedDate }) => {
  const { updateAttendance, deleteStudent } = useAttendance()
  const stats = getStudentStats(student, null, null)
  const record = student.attendance[selectedDate]

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getStatusDisplay = (status: string | null) => {
    if (status === "H") return "حاضر"
    if (status === "G") return "غياب"
    if (status === "E") return "عذر"
    return "-"
  }

  const getStatusBgColor = (status: string | null) => {
    if (status === "H") return "bg-green-100 text-green-800"
    if (status === "G") return "bg-red-100 text-red-800"
    if (status === "E") return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  const handleDelete = () => {
    deleteStudent(student.id)
    setShowDeleteConfirm(false)
  }

  const totalDays = stats.present + stats.absent + stats.excused
  const attendanceRate = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 0

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{student.name}</h3>
            <p className="text-sm text-gray-600">
              <span className={`inline-block px-2 py-1 rounded ${getStatusBgColor(record?.status)}`}>
                {getStatusDisplay(record?.status)}
              </span>
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEditStudent(true)}
              className="text-blue-500 hover:text-blue-700"
              title="تعديل الطالب"
            >
              <Edit2 size={18} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-700"
              title="حذف الطالب"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
          <div className="text-center">
            <p className="text-gray-600">حاضر</p>
            <p className="font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">غياب</p>
            <p className="font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">عذر</p>
            <p className="font-bold text-yellow-600">{stats.excused}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">نسبة الحضور</p>
            <p className="font-bold text-blue-600">{attendanceRate}%</p>
          </div>
        </div>
        <AttendanceStatusButton
          status={record?.status || null}
          onStatusChange={(status, reason) => updateAttendance(student.id, selectedDate, status, reason)}
          date={selectedDate}
          currentReason={record?.reason}
        />

        <div className="flex flex-col mt-3">
          {record?.reason && <p className="text-md text-start text-gray-600">السبب: {record.reason}</p>}
          <Button size="sm" variant="outline" onClick={() => setShowDetails(true)} className="mr-auto">
            <Info size={16} className="mr-1" />
            التفاصيل
          </Button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        studentName={student.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <EditStudentModal isOpen={showEditStudent} student={student} onClose={() => setShowEditStudent(false)} />
      <StudentDetailsModal isOpen={showDetails} student={student} onClose={() => setShowDetails(false)} />
    </>
  )
}

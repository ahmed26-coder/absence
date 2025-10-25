"use client"

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

interface StudentListItemProps {
  student: Student
  selectedDate: string
}

export const StudentListItem: React.FC<StudentListItemProps> = ({ student, selectedDate }) => {
  const { updateAttendance, deleteStudent } = useAttendance()
  const stats = getStudentStats(student, selectedDate, selectedDate)
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

  return (
    <>
      <div className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-3">
          <div className="flex flex-col sm:flex-1">
            <div className="flex flex-row sm:items-center sm:gap-3 lg:justify-start justify-between">
              <p className="font-semibold text-lg sm:text-xl">{student.name}</p>
              <span
                className={`inline-block w-fit px-3 py-1 rounded text-md font-medium mt-1 sm:mt-0 ${getStatusBgColor(
                  record?.status
                )}`}
              >
                {getStatusDisplay(record?.status)}
              </span>
            </div>

            <p className="text-gray-600 font-medium text-base mt-1">
              حاضر: {stats.present} | غياب: {stats.absent} | عذر: {stats.excused}
            </p>

            {record?.reason && (
              <p className="text-gray-700 font-medium text-md mt-1"> السبب: {record.reason}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <AttendanceStatusButton
              status={record?.status || null}
              onStatusChange={(status, reason) => updateAttendance(student.id, selectedDate, status, reason)}
              date={selectedDate}
              currentReason={record?.reason}
            />

            <div className="flex items-center gap-1 sm:gap-2 justify-end sm:justify-start">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEditStudent(true)}
                className="text-blue-500 hover:text-blue-700"
                title="تعديل الطالب"
              >
                <Edit2 size={16} />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700"
                title="حذف الطالب"
              >
                <Trash2 size={16} />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(true)}
                title="عرض التفاصيل"
                className="flex items-center gap-1 text-gray-700 hover:bg-gray-100"
              >
                <Info size={14} />
                <span className="text-sm">التفاصيل</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        studentName={student.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <EditStudentModal
        isOpen={showEditStudent}
        student={student}
        onClose={() => setShowEditStudent(false)}
      />

      <StudentDetailsModal
        isOpen={showDetails}
        student={student}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
}

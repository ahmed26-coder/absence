"use client"

import { useState, useMemo, useEffect } from "react"
import { AttendanceProvider, useAttendance } from "@/components/attendance-context"
import { AddStudentModal } from "@/components/add-student-modal"
import { StudentCard } from "@/components/student-card"
import { StudentListItem } from "@/components/student-list-item"
import { DateRangeSelector } from "@/components/date-range-selector"
import { StatisticsPanel } from "@/components/statistics-panel"
import { ExportButton } from "@/components/export-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Grid3x3, List } from "lucide-react"

const AttendanceContent = () => {
  const { data } = useAttendance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"list" | "card">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("viewMode") as "list" | "card") || "card";
    }
    return "card";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("viewMode", viewMode);
    }
  }, [viewMode]);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [currentPage, setCurrentPage] = useState(0)
  const [filterDate, setFilterDate] = useState("")

  const itemsPerPage = 15

  const filteredStudents = useMemo(() => {
    if (!filterDate) return data.students
    return data.students.filter((student) => {
      const record = student.attendance[filterDate]
      return record !== undefined
    })
  }, [data.students, filterDate])

  const paginatedStudents = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredStudents.slice(start, start + itemsPerPage)
  }, [filteredStudents, currentPage])

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users size={32} />
            نظام تتبع الحضور
          </h1>
          <p className="text-gray-600">إدارة حضور الطلاب بسهولة وكفاءة</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">التاريخ الحالي</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setCurrentPage(0)
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تصفية حسب التاريخ</label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value)
                  setCurrentPage(0)
                }}
                placeholder="اختر تاريخ للتصفية"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode("card")}
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
              >
                <Grid3x3 size={16} />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <StatisticsPanel students={filteredStudents} startDate={startDate} endDate={endDate} />

        {/* Export and Add Student */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            <Users size={18} className="ml-2" />
            إضافة طالب جديد
          </Button>
          <ExportButton students={filteredStudents} startDate={startDate} endDate={endDate} />
        </div>

        {/* Students Display */}
        <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" : ""}>
          {paginatedStudents.map((student) =>
            viewMode === "card" ? (
              <StudentCard
                key={student.id}
                student={student}
                selectedDate={selectedDate}
                startDate={startDate}
                endDate={endDate}
              />

            ) : (
              <StudentListItem key={student.id} student={student} selectedDate={selectedDate} />
            ),
          )}
        </div>


        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="outline"
            >
              السابق
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  variant={currentPage === i ? "default" : "outline"}
                  size="sm"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              variant="outline"
            >
              التالي
            </Button>
          </div>
        )}

        {/* Empty State */}
        {data.students.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">لا توجد طلاب حتى الآن</p>
            <Button onClick={() => setIsModalOpen(true)}>إضافة أول طالب</Button>
          </div>
        )}
      </div>

      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default function Home() {
  return (
    <AttendanceProvider>
      <AttendanceContent />
    </AttendanceProvider>
  )
}

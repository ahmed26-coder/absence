"use client"

import type React from "react"
import type { Student } from "@/lib/types"
import { getStudentStats } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
  students: Student[]
  startDate: string
  endDate: string
}

export const ExportButton: React.FC<ExportButtonProps> = ({ students, startDate, endDate }) => {
  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const { autoTable } = await import("jspdf-autotable")

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Add title
    doc.setFontSize(16)
    doc.text("تقرير الحضور", 14, 15, { align: "right" })

    // Add date range
    doc.setFontSize(10)
    doc.text(`من: ${startDate} إلى: ${endDate}`, 14, 25, { align: "right" })

    // Prepare table data
    const tableData = students.map((student) => {
      const stats = getStudentStats(student, startDate, endDate)
      return [
        student.name,
        stats.present.toString(),
        stats.absent.toString(),
        stats.excused.toString(),
        `${stats.presentPercentage}%`,
      ]
    })

    // Add table
    autoTable(doc, {
      head: [["اسم الطالب", "حاضر", "غياب", "عذر", "نسبة الحضور"]],
      body: tableData,
      startY: 35,
      margin: { right: 14, left: 14 },
      didDrawPage: (data) => {
        // Footer
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.getHeight()
        const pageWidth = pageSize.getWidth()
        doc.setFontSize(8)
        doc.text(`صفحة ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" })
      },
    })

    doc.save(`attendance_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex gap-2">
      <Button onClick={exportToPDF} variant="outline" size="sm">
        <Download size={16} className="ml-2" />
        تصدير PDF
      </Button>
      <Button onClick={handlePrint} variant="outline" size="sm">
        طباعة
      </Button>
    </div>
  )
}

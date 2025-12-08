"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Student } from "@/lib/types"
import { getStudentStats } from "@/lib/storage"

export const ExportButton: React.FC<{ students: Student[]; startDate: string; endDate: string }> = ({
  students,
  startDate,
  endDate,
}) => {
  const exportToPDF = async () => {
    const pdfMakeModule = await import("pdfmake/build/pdfmake")
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts")

    const pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule

    // use bundled vfs fonts; TODO: add Arabic-friendly font via public/fonts when available
    pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs

    const body = [
      [
        { text: "اسم الطالب", bold: true },
        { text: "حاضر", bold: true },
        { text: "غياب", bold: true },
        { text: "عذر", bold: true },
        { text: "نسبة الحضور", bold: true },
      ],
      ...students.map((s) => {
        const stats = getStudentStats(s, startDate, endDate)
        return [
          s.name,
          stats.present.toString(),
          stats.absent.toString(),
          stats.excused.toString(),
          `${stats.presentPercentage}%`,
        ]
      }),
    ]

    const docDefinition = {
      content: [
        { text: "تقرير الحضور", style: "header", alignment: "center" },
        { text: `من: ${startDate} إلى: ${endDate}`, alignment: "center", margin: [0, 5, 0, 15] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto", "auto"],
            body,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true },
      },
      defaultStyle: {
        font: "Helvetica",
        alignment: "right",
      },
    }

    pdfMake.createPdf(docDefinition).download(`تقرير_الحضور_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
    <Button onClick={exportToPDF} variant="outline" size="sm">
      <Download size={16} className="ml-2" />
      تصدير PDF
    </Button>
  )
}

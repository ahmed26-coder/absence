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
    const pdfMakeModule = await import("/fonts/Amiri-Regular.ttf")
    const pdfFontsModule = await import("/fonts/Amiri-Regular.ttf")

    const pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule

    // ✅ تحميل الخط العربي من public
    const fontUrl = "/fonts/Amiri-Regular.ttf"
    const response = await fetch(fontUrl)
    if (!response.ok) {
      console.error("❌ لم يتم العثور على الخط:", fontUrl)
      alert("لم يتم العثور على ملف الخط Amiri-Regular.ttf في مجلد public/fonts/")
      return
    }

    const fontBytes = await response.arrayBuffer()
    const base64Font = btoa(String.fromCharCode(...new Uint8Array(fontBytes)))

    pdfMake.vfs = {
      ...(pdfFonts.vfs || pdfFonts.pdfMake?.vfs),
      "Amiri-Regular.ttf": base64Font,
    }

    pdfMake.fonts = {
      Amiri: {
        normal: "Amiri-Regular.ttf",
        bold: "Amiri-Regular.ttf",
        italics: "Amiri-Regular.ttf",
        bolditalics: "Amiri-Regular.ttf",
      },
    }

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
        font: "Amiri",
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

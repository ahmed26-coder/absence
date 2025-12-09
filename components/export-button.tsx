"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { AttendanceStatus, Student } from "@/lib/types"

type PdfFonts = Record<
  string,
  { normal: string; bold?: string; italics?: string; bolditalics?: string }
>

type PdfMakeInstance = {
  vfs?: Record<string, string>
  fonts?: PdfFonts
  createPdf: (definition: unknown) => { download: (fileName?: string) => void }
}

export const ExportButton: React.FC<{ students: Student[]; startDate: string; endDate: string }> = ({
  students,
  startDate,
  endDate,
}) => {
  const fontReadyRef = useRef<Promise<void> | null>(null)

  const base64FromArrayBuffer = (buffer: ArrayBuffer) => {
    let binary = ""
    const bytes = new Uint8Array(buffer)
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
  }

  const ensureArabicFont = async (pdfMake: PdfMakeInstance) => {
    if (!fontReadyRef.current) {
      fontReadyRef.current = (async () => {
        const response = await fetch("/fonts/Amiri-Regular.ttf")
        if (!response.ok) throw new Error("تعذر تحميل الخط العربي")
        const fontBuffer = await response.arrayBuffer()
        const fontBase64 = base64FromArrayBuffer(fontBuffer)

        pdfMake.vfs = {
          ...(pdfMake.vfs || {}),
          "Amiri-Regular.ttf": fontBase64,
        }

        pdfMake.fonts = {
          ...(pdfMake.fonts || {}),
          Amiri: {
            normal: "Amiri-Regular.ttf",
            bold: "Amiri-Regular.ttf",
            italics: "Amiri-Regular.ttf",
            bolditalics: "Amiri-Regular.ttf",
          },
        }
      })()
    }
    await fontReadyRef.current
  }

  const exportToPDF = async () => {
    const pdfMakeModule = await import("pdfmake/build/pdfmake")
    const pdfMake = (pdfMakeModule.default || pdfMakeModule) as PdfMakeInstance
    await ensureArabicFont(pdfMake)

    // RTL order: name (rightmost), then Friday → Thursday
    const daysOfWeek = ["الجمعة", "السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"]
    const columnWidths = [70, ...daysOfWeek.map(() => "*")] // name column narrower; days flex to fill width

    // Build a 7-day range starting from startDate
    const rangeAnchor = startDate || endDate
    const start = new Date((rangeAnchor ?? "") + "T00:00:00")
    const weekDates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      weekDates.push(d.toISOString().split("T")[0])
    }

    const statusLabel = (status?: AttendanceStatus | null) => {
      switch (status) {
        case "H":
          return "حاضر"
        case "G":
          return "غائب"
        case "E":
          return "بعذر"
        default:
          return "_"
      }
    }

    const body = [
      [
        { text: "اسم الطالب", style: "tableHeader", fillColor: "#3b82f6", color: "white", margin: [2, 4] },
        ...daysOfWeek.map((day) => ({
          text: day,
          style: "tableHeader",
          fillColor: "#3b82f6",
          color: "white",
          margin: [2, 4],
        })),
      ],
      ...students.map((student) => {
        const row = [{ text: student.name, style: "cellText", margin: [2, 4], alignment: "right" }]
        daysOfWeek.forEach((_, idx) => {
          const dateForThisDay = weekDates[idx] || null
          const record = dateForThisDay ? student.attendance?.[dateForThisDay] : null
          row.push({ text: statusLabel(record?.status), style: "cellText", margin: [2, 4], alignment: "right" })
        })
        return row
      }),
    ]

    const docDefinition = {
      pageMargins: [20, 24, 20, 28],
      pageDirection: 'rtl',
      defaultStyle: { font: 'Amiri', alignment: 'right' },
      content: [
        { text: "تقرير الحضور الأسبوعي", style: "header", alignment: "center", margin: [0, 0, 0, 10] },
        { text: `من: ${weekDates[0]} إلى: ${weekDates[6]}`, alignment: "center", margin: [0, 0, 0, 15] },
        {
          table: {
            headerRows: 1,
            widths: columnWidths,
            body: body.map(row => row.map(cell => ({ ...cell, alignment: 'right' }))),
        },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? "#3b82f6" : rowIndex % 2 === 0 ? "#f3f4f6" : "#ffffff",
            hLineColor: "#e5e7eb",
            vLineColor: "#e5e7eb",
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        tableHeader: { fontSize: 12, bold: true, alignment: "center" },
        cellText: { fontSize: 11, alignment: "right" },
      },
    }

    const today = new Date().toISOString().split("T")[0]
    pdfMake.createPdf(docDefinition).download(`تقرير الحضور الأسبوعي ${today}.pdf`)
  }

  return (
    <Button onClick={exportToPDF} variant="outline" size="sm">
      <Download size={16} className="ml-2" />
      تصدير PDF
    </Button>
  )
}
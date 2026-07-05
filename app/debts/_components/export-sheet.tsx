"use client"

import type { ReactNode } from "react"

import { usePayments } from "./use-payments"
import { Sheet, SheetGrip } from "./sheet"
import { FileIcon, PrintIcon } from "./icons"

function ExportRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        padding: "13px",
        borderRadius: "13px",
        border: "1px solid var(--line)",
        background: "var(--paper)",
        cursor: "pointer",
        textAlign: "start",
      }}
    >
      <span
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {icon}
      </span>
      <span>
        <span style={{ display: "block", fontWeight: 700, fontSize: "13.5px", color: "var(--ink)" }}>{title}</span>
        <span style={{ display: "block", fontSize: "11px", color: "var(--muted)" }}>{subtitle}</span>
      </span>
    </button>
  )
}

export function ExportSheet() {
  const p = usePayments()

  return (
    <Sheet open={p.exportOpen} onClose={() => p.setExportOpen(false)} label="تصدير الكشف" variant="sheet" width={460}>
      <div className="p-4 pb-6">
        <SheetGrip />
        <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "12px" }}>تصدير كشف {p.monthLabel}</div>
        <div className="space-y-2.5">
          <ExportRow
            icon={<FileIcon size={19} />}
            iconBg="var(--rose-bg)"
            iconColor="var(--rose)"
            title="تصدير ملف PDF"
            subtitle="كشف مفصّل بكل العمليات"
            onClick={p.exportPdf}
          />
          <ExportRow
            icon={<PrintIcon size={19} />}
            iconBg="var(--slate-bg)"
            iconColor="var(--slate)"
            title="طباعة الكشف"
            subtitle="نسخة ورقية للأرشيف"
            onClick={p.printStatement}
          />
        </div>
      </div>
    </Sheet>
  )
}

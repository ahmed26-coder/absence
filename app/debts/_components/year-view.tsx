"use client"

import { formatMoney } from "@/lib/payments/logic"
import type { YearCell, YearTag } from "@/lib/payments/logic"
import { usePayments } from "./use-payments"

const TAG_META: Record<YearTag, { label: string; bg: string; fg: string }> = {
  current: { label: "الحالي", bg: "var(--green)", fg: "#fff" },
  upcoming: { label: "قادم", bg: "var(--bg)", fg: "var(--muted)" },
  arrears: { label: "متأخرات", bg: "var(--rose-bg)", fg: "var(--rose)" },
  complete: { label: "مكتمل", bg: "var(--green-bg)", fg: "var(--green-d)" },
}

function barColor(cell: YearCell): string {
  if (cell.isFuture) return "var(--line)"
  if (cell.rate >= 95) return "var(--green)"
  if (cell.rate >= 80) return "var(--gold)"
  return "var(--rose)"
}

function rateTone(cell: YearCell): string {
  if (cell.isFuture) return "var(--muted)"
  if (cell.rate >= 95) return "var(--green-d)"
  if (cell.rate >= 80) return "var(--gold-d)"
  return "var(--rose)"
}

function Cell({ cell }: { cell: YearCell }) {
  const p = usePayments()
  const tag = TAG_META[cell.tag]
  return (
    <button
      type="button"
      onClick={() => {
        p.setMonthIndex(cell.monthIndex)
        p.setView("month")
      }}
      style={{
        textAlign: "start",
        cursor: "pointer",
        background: "var(--paper)",
        border: cell.isCurrent ? "1.5px solid var(--green)" : "1px solid var(--line)",
        borderRadius: "16px",
        padding: "13px 14px",
        boxShadow: cell.isCurrent ? "0 8px 20px -12px var(--green)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 800, fontSize: "14.5px", color: cell.isCurrent ? "var(--green-d)" : "var(--ink)" }}>
          {cell.name}
        </span>
        <span style={{ fontSize: "9.5px", fontWeight: 800, padding: "2px 7px", borderRadius: "999px", background: tag.bg, color: tag.fg }}>
          {tag.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginTop: "11px" }}>
        <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--ink)" }}>{formatMoney(cell.incoming)}</span>
        <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>من {formatMoney(cell.expected)}</span>
      </div>
      <div style={{ height: "6px", borderRadius: "3px", background: "var(--line2)", marginTop: "9px", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: "3px", background: barColor(cell), width: `${cell.rate}%` }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>متبقٍ {formatMoney(cell.remaining)}</span>
        <span style={{ fontSize: "12px", fontWeight: 800, color: rateTone(cell) }}>{cell.rate}٪</span>
      </div>
    </button>
  )
}

export function PaymentsYearView() {
  const p = usePayments()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-heading" style={{ fontWeight: 800, fontSize: "17px" }}>
          نظرة السنة · {p.yearOnly}
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--muted)", fontWeight: 600 }}>
          إجمالي التحصيل السنوي {p.yearOverview.rate}٪
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {p.yearOverview.cells.map((cell) => (
          <Cell key={cell.monthIndex} cell={cell} />
        ))}
      </div>
    </div>
  )
}

"use client"

import { GREG_MONTHS, HIJRI_MONTHS } from "@/lib/payments/constants"
import { usePayments } from "./use-payments"
import { Sheet, SheetGrip } from "./sheet"
import { ChevronLeft, ChevronRight } from "./icons"

export function MonthPicker() {
  const p = usePayments()
  const months = p.calendar === "hijri" ? HIJRI_MONTHS : GREG_MONTHS

  return (
    <Sheet open={p.pickerOpen} onClose={() => p.setPickerOpen(false)} label="اختيار الشهر" variant="sheet" width={420}>
      <div className="p-4 pb-6">
        <SheetGrip />
        <div className="mb-3.5 flex items-center justify-between">
          {/* Year navigation is unavailable — a single year is loaded at a time. */}
          <span aria-hidden className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-[var(--line)] bg-[var(--bg)] opacity-40">
            <ChevronRight size={17} />
          </span>
          <div className="text-center">
            <div style={{ fontWeight: 800, fontSize: "19px" }}>{p.yearOnly}</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>{p.calLabel}</div>
          </div>
          <span aria-hidden className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-[var(--line)] bg-[var(--bg)] opacity-40">
            <ChevronLeft size={17} />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((name, i) => {
            const on = i === p.monthIndex
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  p.setMonthIndex(i)
                  p.setPickerOpen(false)
                }}
                aria-current={on ? "true" : undefined}
                style={{
                  height: "44px",
                  borderRadius: "11px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  border: on ? "1.5px solid var(--green)" : "1px solid var(--line)",
                  background: on ? "var(--green-bg)" : "var(--paper)",
                  color: on ? "var(--green-d)" : "var(--ink2)",
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>
    </Sheet>
  )
}

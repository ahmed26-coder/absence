"use client"

import { FILTER_LABELS, SORT_DEFS } from "@/lib/payments/constants"
import { usePayments } from "./use-payments"
import { Sheet, SheetGrip } from "./sheet"
import { seg, segGroup } from "./styles"

export function FilterSheet() {
  const p = usePayments()

  return (
    <Sheet open={p.filterOpen} onClose={() => p.setFilterOpen(false)} label="تصفية العمليات" variant="sheet" width={460}>
      <div className="p-4 pb-6">
        <SheetGrip />
        <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "12px" }}>تصفية العمليات</div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {p.tabs.map((t) => {
            const on = t.active
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  p.setFilter(t.key)
                  p.setFilterOpen(false)
                }}
                aria-current={on ? "true" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: "50px",
                  padding: "0 14px",
                  borderRadius: "13px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: on ? "1.5px solid var(--green)" : "1px solid var(--line)",
                  background: on ? "var(--green-bg)" : "var(--paper)",
                  color: on ? "var(--green-d)" : "var(--ink)",
                }}
              >
                <span>{FILTER_LABELS[t.key]}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: on ? "var(--green)" : "var(--bg)",
                    color: on ? "#fff" : "var(--muted)",
                  }}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink2)", marginBottom: "8px" }}>الترتيب</div>
        <div style={segGroup}>
          {SORT_DEFS.map((sortDef) => (
            <button
              key={sortDef.key}
              type="button"
              onClick={() => p.setSortBy(sortDef.key)}
              style={{ ...seg(p.sortBy === sortDef.key), flex: 1 }}
            >
              {sortDef.label}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

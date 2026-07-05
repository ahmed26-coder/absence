"use client"

import { SORT_DEFS } from "@/lib/payments/constants"
import { usePayments } from "./use-payments"
import { seg, segGroup, tabPill, tabCount } from "./styles"

export function PaymentsTabs() {
  const p = usePayments()

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div
        className="pay-tabs -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        role="tablist"
        aria-label="تصفية العمليات"
      >
        {p.tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.active}
            onClick={() => p.setFilter(t.key)}
            style={tabPill(t.active)}
          >
            {t.label}
            <span style={tabCount(t.active)}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <span style={{ fontSize: "11.5px", color: "var(--muted)", fontWeight: 600 }}>ترتيب:</span>
        <div style={segGroup}>
          {SORT_DEFS.map((sortDef) => (
            <button
              key={sortDef.key}
              type="button"
              onClick={() => p.setSortBy(sortDef.key)}
              style={seg(p.sortBy === sortDef.key)}
            >
              {sortDef.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

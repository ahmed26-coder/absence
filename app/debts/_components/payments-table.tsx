"use client"

import type { CSSProperties } from "react"

import type { Payment } from "@/lib/payments/types"
import { usePayments } from "./use-payments"
import { deriveItem } from "./item-view"
import { badge, flowPill } from "./styles"
import { ArrowApply, CheckIcon, ChevronLeft } from "./icons"

const GRID = "minmax(230px,2.6fr) 132px 96px 96px 96px 108px 230px 46px"

const centerNum: CSSProperties = { textAlign: "center", fontWeight: 800, fontSize: "13.5px" }

function Row({ it }: { it: Payment }) {
  const p = usePayments()
  const v = deriveItem(it, p.refDay, p.monthNameOnly, p.errorId)
  const draft = p.drafts[it.id] ?? ""

  return (
    <div
      role="row"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: GRID,
        alignItems: "center",
        gap: "8px",
        padding: "12px 18px",
        borderBottom: "1px solid var(--line2)",
        opacity: v.isCancelled ? 0.6 : 1,
        animation: v.hasError ? "payShake .5s" : undefined,
      }}
    >
      <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "3px", background: v.barColor }} />

      <div role="cell" style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "13.5px",
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textDecoration: v.isCancelled ? "line-through" : "none",
          }}
        >
          {it.name}
        </div>
        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginTop: "1px", display: "flex", gap: "6px", alignItems: "center" }}>
          <span>{it.category}</span>
          <span style={flowPill(v.flowBg, v.flowFg)}>{v.flowLabel} · {v.kindLabel}</span>
        </div>
      </div>

      <div role="cell">
        <span style={badge(v.badgeBg, v.badgeFg)}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: v.dotColor }} />
          {v.statusLabel}
        </span>
      </div>

      <div role="cell" style={centerNum}>{v.expected}</div>
      <div role="cell" style={{ ...centerNum, color: "var(--green)" }}>{v.paid}</div>
      <div role="cell" style={{ ...centerNum, color: v.remTone }}>{v.remaining}</div>
      <div role="cell" style={{ textAlign: "center", fontWeight: 700, fontSize: "12px", color: v.dueTone }}>{v.dueLabel}</div>

      <div role="cell">
        {v.showActions ? (
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <button
              type="button"
              onClick={() => p.quickToggle(it.id)}
              disabled={p.isPending}
              aria-label={v.isFull ? `تراجع عن تأكيد ${it.name}` : `تأكيد وصول ${it.name}`}
              style={{ flex: "none", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#fff" }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  border: `2px solid ${v.isFull ? "var(--green)" : "var(--line)"}`,
                  background: v.isFull ? "var(--green)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {v.quickChecked && <CheckIcon size={12} sw={3} />}
              </span>
            </button>

            {v.showPartial && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  height: "32px",
                  padding: "0 4px 0 10px",
                  borderRadius: "9px",
                  border: `1.5px solid ${v.hasError ? "var(--rose)" : "var(--line)"}`,
                  background: "var(--paper)",
                  maxWidth: "170px",
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => p.setDrafts((d) => ({ ...d, [it.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && p.applyEntry(it.id, draft, false)}
                  inputMode="numeric"
                  placeholder="دفعة جزئية"
                  aria-label={`دفعة جزئية لـ ${it.name}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    width: "100%",
                    border: "none",
                    background: "none",
                    outline: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--ink)",
                    textAlign: "center",
                  }}
                />
                <button
                  type="button"
                  onClick={() => p.applyEntry(it.id, draft, false)}
                  disabled={p.isPending}
                  aria-label="تسجيل الدفعة الجزئية"
                  style={{
                    flex: "none",
                    width: "26px",
                    height: "26px",
                    borderRadius: "7px",
                    border: "none",
                    background: "var(--green)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ArrowApply size={13} />
                </button>
              </div>
            )}

            {v.isFull && <span style={{ fontSize: "11.5px", color: "var(--green-d)", fontWeight: 700 }}>مكتمل</span>}
          </div>
        ) : (
          <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>—</span>
        )}
      </div>

      <div role="cell">
        <button
          type="button"
          onClick={() => p.setOpenId(it.id)}
          aria-label={`تفاصيل ${it.name}`}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            color: "var(--ink2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  )
}

export function PaymentsTable() {
  const p = usePayments()

  return (
    <div
      role="region"
      aria-label="جدول المدفوعات"
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 1px 2px oklch(0.3 0.05 150 / .04)",
      }}
    >
      <div className="pay-tabs" style={{ overflowX: "auto" }}>
        <div role="table" aria-label="جدول المدفوعات" style={{ minWidth: "1060px" }}>
          <div
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              alignItems: "center",
              gap: "8px",
              padding: "12px 18px",
              background: "var(--bg)",
              borderBottom: "1px solid var(--line)",
              fontSize: "11.5px",
              fontWeight: 800,
              color: "var(--muted)",
            }}
          >
            <div role="columnheader">الدافع / المصدر</div>
            <div role="columnheader">الحالة</div>
            <div role="columnheader" style={{ textAlign: "center" }}>المتوقع</div>
            <div role="columnheader" style={{ textAlign: "center" }}>المدفوع</div>
            <div role="columnheader" style={{ textAlign: "center" }}>المتبقي</div>
            <div role="columnheader" style={{ textAlign: "center" }}>الاستحقاق</div>
            <div role="columnheader" style={{ textAlign: "center" }}>تحصيل سريع</div>
            <div role="columnheader" aria-label="إجراءات" />
          </div>
          {p.visibleItems.map((it) => (
            <Row key={it.id} it={it} />
          ))}
        </div>
      </div>
    </div>
  )
}

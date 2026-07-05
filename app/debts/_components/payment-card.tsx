"use client"

import type { Payment } from "@/lib/payments/types"
import { usePayments } from "./use-payments"
import { deriveItem } from "./item-view"
import { badge, flowPill } from "./styles"
import { ArrowApply, CheckIcon, ChevronLeft, NoteLines } from "./icons"

export function PaymentCard({ it }: { it: Payment }) {
  const p = usePayments()
  const v = deriveItem(it, p.refDay, p.monthNameOnly, p.errorId)
  const draft = p.drafts[it.id] ?? ""

  return (
    <div
      style={{
        position: "relative",
        background: "var(--paper)",
        border: `1px solid ${v.hasError ? "var(--rose)" : "var(--line)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 2px oklch(0.3 0.05 150 / .04)",
        opacity: v.isCancelled ? 0.62 : 1,
        animation: v.hasError ? "payShake .5s" : undefined,
      }}
    >
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "4px", background: v.barColor }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
              <span style={badge(v.badgeBg, v.badgeFg)}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: v.dotColor }} />
                {v.statusLabel}
              </span>
              <span style={flowPill(v.flowBg, v.flowFg)}>{v.flowLabel}</span>
              <span style={{ fontSize: "10.5px", color: "var(--muted)", fontWeight: 600 }}>· {v.kindLabel}</span>
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "14.5px",
                color: "var(--ink)",
                marginTop: "5px",
                textDecoration: v.isCancelled ? "line-through" : "none",
                lineHeight: 1.35,
              }}
            >
              {it.name}
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginTop: "1px" }}>{it.category}</div>
          </div>
          <button
            type="button"
            onClick={() => p.setOpenId(it.id)}
            aria-label={`تفاصيل ${it.name}`}
            style={{
              flex: "none",
              width: "32px",
              height: "32px",
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
            <ChevronLeft size={17} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "11px" }}>
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "2px",
              background: "var(--bg)",
              borderRadius: "11px",
              padding: "8px 6px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9.5px", color: "var(--muted)", fontWeight: 600 }}>متوقع</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--ink)", marginTop: "2px" }}>{v.expected}</div>
            </div>
            <div style={{ textAlign: "center", borderRight: "1px solid var(--line)", borderLeft: "1px solid var(--line)" }}>
              <div style={{ fontSize: "9.5px", color: "var(--muted)", fontWeight: 600 }}>مدفوع</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--green)", marginTop: "2px" }}>{v.paid}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9.5px", color: "var(--muted)", fontWeight: 600 }}>متبقٍ</div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: v.remTone, marginTop: "2px" }}>{v.remaining}</div>
            </div>
          </div>
          <div style={{ flex: "none", textAlign: "center" }}>
            <div style={{ fontSize: "9.5px", color: "var(--muted)", fontWeight: 600 }}>الاستحقاق</div>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: v.dueTone, marginTop: "3px", whiteSpace: "nowrap" }}>
              {v.dueLabel}
            </div>
          </div>
        </div>

        {v.showProgress && (
          <div style={{ height: "5px", borderRadius: "3px", background: "var(--line2)", marginTop: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "3px", background: v.barColor, width: `${v.pct}%` }} />
          </div>
        )}

        {it.note && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginTop: "9px", background: "var(--gold-bg)", borderRadius: "9px", padding: "7px 9px" }}>
            <span style={{ color: "var(--gold-d)", flex: "none", marginTop: "1px", display: "flex" }}>
              <NoteLines size={13} />
            </span>
            <span style={{ fontSize: "11.5px", color: "var(--ink2)", lineHeight: 1.5 }}>{it.note}</span>
          </div>
        )}

        {v.showActions && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "11px" }}>
            <button
              type="button"
              onClick={() => p.quickToggle(it.id)}
              disabled={p.isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                flex: "none",
                height: "38px",
                padding: "0 13px 0 11px",
                borderRadius: "11px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px",
                border: `1px solid ${v.isFull ? "var(--green)" : "var(--line)"}`,
                background: v.isFull ? "var(--green-bg)" : "var(--paper)",
                color: v.isFull ? "var(--green-d)" : "var(--ink2)",
              }}
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
                  flex: "none",
                  color: "#fff",
                }}
              >
                {v.quickChecked && <CheckIcon size={13} sw={3} />}
              </span>
              {v.isFull ? "وصلت كاملة" : "تأكيد الوصول"}
            </button>

            {v.showPartial && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "38px",
                  padding: "0 5px 0 12px",
                  borderRadius: "11px",
                  border: `1.5px solid ${v.hasError ? "var(--rose)" : "var(--line)"}`,
                  background: "var(--paper)",
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
                    fontSize: "12.5px",
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
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--green)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ArrowApply size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

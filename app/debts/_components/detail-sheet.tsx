"use client"

import type { CSSProperties } from "react"

import { formatMoney, remainingOf } from "@/lib/payments/logic"
import { usePayments } from "./use-payments"
import { deriveItem } from "./item-view"
import { Sheet } from "./sheet"
import { badge, flowPill } from "./styles"
import { CheckIcon, ClockIcon, CoinsIcon, TrashIcon, XIcon } from "./icons"

const statCard: CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: "13px",
  padding: "12px",
  textAlign: "center",
}

export function DetailSheet() {
  const p = usePayments()
  const it = p.openItem
  if (!it) return null

  const v = deriveItem(it, p.refDay, p.monthNameOnly, p.errorId)
  const rem = remainingOf(it)
  const canPay = v.showPartial
  const hasError = p.errorId === it.id

  return (
    <Sheet open={!!p.openId} onClose={() => p.setOpenId(null)} label={`تفاصيل ${it.name}`} variant="sheet" tall width={560}>
      {/* header */}
      <div className="flex-none border-b border-[var(--line2)] bg-[var(--paper)] px-5 pb-3.5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span style={badge(v.badgeBg, v.badgeFg)}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: v.dotColor }} />
                {v.statusLabel}
              </span>
              <span style={flowPill(v.flowBg, v.flowFg)}>{v.flowLabel} · {v.kindLabel}</span>
            </div>
            <div className="font-heading" style={{ fontWeight: 700, fontSize: "19px", color: "var(--ink)", lineHeight: 1.3 }}>
              {it.name}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>
              {it.category} · الاستحقاق {v.dueLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={() => p.setOpenId(null)}
            aria-label="إغلاق التفاصيل"
            style={{
              flex: "none",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <XIcon size={17} />
          </button>
        </div>
      </div>

      {/* body */}
      <div className="pay-scroll flex-1 overflow-y-auto px-5 pb-5 pt-4">
        <div className="grid grid-cols-3 gap-2.5">
          <div style={statCard}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>المتوقع</div>
            <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "4px" }}>{v.expected}</div>
          </div>
          <div style={statCard}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>المدفوع</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--green)", marginTop: "4px" }}>{v.paid}</div>
          </div>
          <div style={statCard}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>المتبقي</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: v.remTone, marginTop: "4px" }}>{v.remaining}</div>
          </div>
        </div>

        {canPay && (
          <div
            style={{
              marginTop: "14px",
              background: hasError ? "var(--rose-bg)" : "var(--bg)",
              border: `1px solid ${hasError ? "var(--rose)" : "var(--line)"}`,
              borderRadius: "15px",
              padding: "13px",
              animation: hasError ? "payShake .5s" : undefined,
            }}
          >
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--ink2)", marginBottom: "9px" }}>تسجيل دفعة جديدة</div>
            <div className="flex gap-2.5">
              <div
                className="flex flex-1 items-center gap-1.5"
                style={{ background: "var(--paper)", border: "1.5px solid var(--line)", borderRadius: "11px", padding: "0 13px", height: "46px" }}
              >
                <input
                  value={p.detailDraft}
                  onChange={(e) => p.setDetailDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && p.applyEntry(it.id, p.detailDraft, true)}
                  inputMode="numeric"
                  placeholder="المبلغ"
                  aria-label="مبلغ الدفعة"
                  style={{ flex: 1, minWidth: 0, border: "none", background: "none", outline: "none", fontSize: "15px", fontWeight: 800, color: "var(--ink)" }}
                />
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>ج.م</span>
              </div>
              <button
                type="button"
                onClick={() => p.applyEntry(it.id, p.detailDraft, true)}
                disabled={p.isPending}
                style={{ flex: "none", padding: "0 20px", height: "46px", borderRadius: "11px", border: "none", background: "var(--green)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
              >
                تسجيل
              </button>
            </div>
            <div className="mt-2.5 flex gap-2">
              <button
                type="button"
                onClick={() => p.setDetailDraft(String(rem))}
                style={{ flex: 1, height: "36px", borderRadius: "9px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--green-d)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                المتبقي كاملًا ({v.remaining})
              </button>
              <button
                type="button"
                onClick={() => p.setDetailDraft(String(Math.max(1, Math.round(rem / 2))))}
                style={{ flex: "none", padding: "0 16px", height: "36px", borderRadius: "9px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink2)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                النصف
              </button>
            </div>
          </div>
        )}

        {/* payments log */}
        <div className="mt-[18px]">
          <div className="mb-2.5 flex items-center gap-1.5">
            <span style={{ color: "var(--green)", display: "flex" }}>
              <CoinsIcon size={15} />
            </span>
            <span style={{ fontWeight: 800, fontSize: "14px" }}>سجل الدفعات الجزئية</span>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>({it.entries.length})</span>
          </div>
          {it.entries.length > 0 ? (
            <div className="flex flex-col gap-2">
              {it.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2.5"
                  style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "12px", padding: "11px 13px" }}
                >
                  <span
                    style={{ flex: "none", width: "30px", height: "30px", borderRadius: "9px", background: "var(--green-bg)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <CheckIcon size={15} sw={2.2} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "14px" }}>{formatMoney(entry.amount)} ج.م</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)" }}>{entry.note}</div>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink2)", fontWeight: 600 }}>
                    {entry.day} {p.monthNameOnly}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "16px", border: "1px dashed var(--line)", borderRadius: "12px", fontSize: "12.5px", color: "var(--muted)" }}>
              لم تُسجَّل أي دفعة بعد
            </div>
          )}
        </div>

        {/* history */}
        <div className="mt-[18px]">
          <div className="mb-2.5 flex items-center gap-1.5">
            <span style={{ color: "var(--muted)", display: "flex" }}>
              <ClockIcon size={15} />
            </span>
            <span style={{ fontWeight: 800, fontSize: "14px" }}>سجل التعديلات</span>
          </div>
          <div style={{ position: "relative", paddingInlineEnd: "0", paddingRight: "14px" }}>
            <div style={{ position: "absolute", top: "6px", bottom: "6px", right: "4px", width: "1.5px", background: "var(--line)" }} />
            {it.events.map((ev) => (
              <div key={ev.id} style={{ position: "relative", padding: "0 0 13px" }}>
                <div style={{ position: "absolute", right: "-13px", top: "3px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--bg)", border: "2px solid var(--green)" }} />
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>{ev.text}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>
                  {ev.day} {p.monthNameOnly}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex flex-none gap-2.5 border-t border-[var(--line)] bg-[var(--paper)] px-5 py-3.5">
        <button
          type="button"
          onClick={p.toggleCancelOpen}
          disabled={p.isPending}
          style={{ flex: 1, height: "46px", borderRadius: "12px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink2)", fontWeight: 700, fontSize: "13.5px", cursor: "pointer" }}
        >
          {it.cancelled ? "إعادة تفعيل العملية" : "إلغاء العملية"}
        </button>
        <button
          type="button"
          onClick={() => p.setConfirmId(it.id)}
          aria-label="حذف العملية"
          style={{
            flex: "none",
            padding: "0 18px",
            height: "46px",
            borderRadius: "12px",
            border: "1px solid oklch(0.53 0.16 25 / .25)",
            background: "var(--rose-bg)",
            color: "var(--rose)",
            fontWeight: 700,
            fontSize: "13.5px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            cursor: "pointer",
          }}
        >
          <TrashIcon size={17} />
          حذف
        </button>
      </div>
    </Sheet>
  )
}

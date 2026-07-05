"use client"

import type { CSSProperties } from "react"

import { EXPENSE_CATS, INCOME_CATS } from "@/lib/payments/constants"
import type { AddForm } from "@/lib/payments/types"
import { usePayments } from "./use-payments"
import { Sheet } from "./sheet"
import { ArrowDown, ArrowUp, PlusIcon, XIcon } from "./icons"

function toggleBtn(on: boolean, accent: string): CSSProperties {
  return {
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "44px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
    border: on ? `1.5px solid ${accent}` : "1px solid var(--line)",
    background: on ? `color-mix(in oklch, ${accent} 10%, white)` : "var(--paper)",
    color: on ? accent : "var(--ink2)",
  }
}

const fieldLabel: CSSProperties = { fontSize: "12px", fontWeight: 700, color: "var(--ink2)", marginBottom: "7px" }
const textField: CSSProperties = {
  width: "100%",
  height: "46px",
  border: "1.5px solid var(--line)",
  borderRadius: "12px",
  padding: "0 13px",
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--ink)",
  outline: "none",
  background: "var(--paper)",
}

export function AddSheet() {
  const p = usePayments()
  const f = p.addForm
  if (!f) return null

  const patch = (next: Partial<AddForm>) => p.setAddForm({ ...f, ...next })
  const cats = f.flow === "income" ? INCOME_CATS : EXPENSE_CATS
  const title = f.flow === "expense" ? "إضافة مصروف" : f.kind === "fixed" ? "إضافة مصدر دخل ثابت" : "إضافة دفعة"
  const cta = f.flow === "expense" ? "إضافة المصروف" : f.kind === "fixed" ? "إضافة المصدر" : "إضافة الدفعة"

  return (
    <Sheet open={!!p.addForm} onClose={() => p.setAddForm(null)} label={title} variant="sheet" tall width={520}>
      {/* header */}
      <div className="flex flex-none items-center justify-between border-b border-[var(--line2)] px-5 pb-3.5 pt-4">
        <div className="font-heading" style={{ fontWeight: 700, fontSize: "19px" }}>
          {title}
        </div>
        <button
          type="button"
          onClick={() => p.setAddForm(null)}
          aria-label="إغلاق"
          style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <XIcon size={17} />
        </button>
      </div>

      {/* body */}
      <div className="pay-scroll flex-1 overflow-y-auto px-5 py-4">
        <div style={fieldLabel}>النوع</div>
        <div className="mb-3.5 flex gap-2.5">
          <button type="button" onClick={() => patch({ flow: "income", category: INCOME_CATS[0] })} style={toggleBtn(f.flow === "income", "var(--green)")}>
            <ArrowUp size={16} />
            دخل
          </button>
          <button type="button" onClick={() => patch({ flow: "expense", category: EXPENSE_CATS[0] })} style={toggleBtn(f.flow === "expense", "var(--rose)")}>
            <ArrowDown size={16} />
            مصروف
          </button>
        </div>

        <div style={fieldLabel}>التصنيف</div>
        <div className="mb-3.5 flex gap-2.5">
          <button type="button" onClick={() => patch({ kind: "fixed" })} style={toggleBtn(f.kind === "fixed", "var(--gold-d)")}>
            ثابت متكرر
          </button>
          <button type="button" onClick={() => patch({ kind: "variable" })} style={toggleBtn(f.kind === "variable", "var(--slate)")}>
            متغير
          </button>
        </div>

        <label style={fieldLabel} htmlFor="pay-add-name">
          اسم الدافع / مصدر الدفع
        </label>
        <input
          id="pay-add-name"
          value={f.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="مثال: اشتراك شهري — أسرة …"
          className="mb-3.5"
          style={textField}
        />

        <div style={fieldLabel}>المصدر</div>
        <div className="pay-tabs mb-3.5 flex gap-2 overflow-x-auto pb-0.5">
          {cats.map((c) => {
            const on = f.category === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => patch({ category: c })}
                style={{
                  flex: "none",
                  height: "36px",
                  padding: "0 13px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                  fontSize: "12px",
                  border: on ? "1px solid var(--green)" : "1px solid var(--line)",
                  background: on ? "var(--green)" : "var(--paper)",
                  color: on ? "#fff" : "var(--ink2)",
                }}
              >
                {c}
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label style={fieldLabel} htmlFor="pay-add-expected">
              المبلغ المتوقع
            </label>
            <div className="flex items-center gap-1.5" style={{ height: "46px", border: "1.5px solid var(--line)", borderRadius: "12px", padding: "0 13px", background: "var(--paper)" }}>
              <input
                id="pay-add-expected"
                value={f.expected}
                onChange={(e) => patch({ expected: e.target.value })}
                inputMode="numeric"
                placeholder="0"
                style={{ flex: 1, minWidth: 0, border: "none", background: "none", outline: "none", fontSize: "15px", fontWeight: 800, color: "var(--ink)" }}
              />
              <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600 }}>ج.م</span>
            </div>
          </div>
          <div style={{ flex: "none", width: "128px" }}>
            <div style={fieldLabel}>يوم الاستحقاق</div>
            <div className="flex items-center overflow-hidden" style={{ height: "46px", border: "1.5px solid var(--line)", borderRadius: "12px", background: "var(--paper)" }}>
              <button
                type="button"
                onClick={() => patch({ dueDay: Math.max(1, f.dueDay - 1) })}
                aria-label="إنقاص يوم الاستحقاق"
                style={{ width: "40px", height: "100%", border: "none", background: "var(--bg)", color: "var(--ink2)", fontSize: "18px", fontWeight: 700, cursor: "pointer" }}
              >
                −
              </button>
              <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: "15px" }} aria-live="polite">
                {f.dueDay}
              </div>
              <button
                type="button"
                onClick={() => patch({ dueDay: Math.min(28, f.dueDay + 1) })}
                aria-label="زيادة يوم الاستحقاق"
                style={{ width: "40px", height: "100%", border: "none", background: "var(--bg)", color: "var(--ink2)", fontSize: "18px", fontWeight: 700, cursor: "pointer" }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <label style={{ ...fieldLabel, margin: "14px 0 7px" }} htmlFor="pay-add-note">
          ملاحظة (اختياري)
        </label>
        <input
          id="pay-add-note"
          value={f.note}
          onChange={(e) => patch({ note: e.target.value })}
          placeholder="ملاحظة قصيرة"
          style={textField}
        />
      </div>

      {/* footer */}
      <div className="flex-none border-t border-[var(--line)] bg-[var(--paper)] px-5 py-3.5">
        <button
          type="button"
          onClick={p.submitAdd}
          disabled={p.isPending}
          style={{
            width: "100%",
            height: "50px",
            borderRadius: "13px",
            border: "none",
            background: "var(--green)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 12px 24px -12px var(--green)",
            opacity: p.isPending ? 0.75 : 1,
          }}
        >
          <PlusIcon size={19} />
          {cta}
        </button>
      </div>
    </Sheet>
  )
}

"use client"

import type { CSSProperties } from "react"

import { usePayments } from "./use-payments"
import { CoinsIcon, HomeIcon, PlusIcon } from "./icons"

const optionBtn: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  height: "44px",
  padding: "0 15px 0 13px",
  borderRadius: "14px",
  border: "1px solid var(--line)",
  background: "var(--paper)",
  color: "var(--ink)",
  fontWeight: 700,
  fontSize: "12.5px",
  boxShadow: "0 8px 20px -10px oklch(0.3 0.05 150 / .5)",
  cursor: "pointer",
}

export function PaymentsFab() {
  const p = usePayments()
  if (p.view !== "month") return null

  return (
    <div className="md:hidden print:hidden">
      {p.fabOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => p.setFabOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-[oklch(0.2_0.02_150/0.25)] motion-safe:animate-[payFade_.18s_ease]"
          tabIndex={-1}
        />
      )}
      <div className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-2.5">
        {p.fabOpen && (
          <div className="flex flex-col gap-2 motion-safe:animate-[payFade_.18s_ease]">
            <button type="button" onClick={() => p.openAdd("fixed")} style={optionBtn}>
              <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--gold-bg)", color: "var(--gold-d)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HomeIcon size={16} />
              </span>
              مصدر دخل ثابت
            </button>
            <button type="button" onClick={() => p.openAdd("variable")} style={optionBtn}>
              <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--green-bg)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CoinsIcon size={16} />
              </span>
              دفعة جديدة
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => p.setFabOpen(!p.fabOpen)}
          aria-label={p.fabOpen ? "إغلاق قائمة الإضافة" : "إضافة عملية"}
          aria-expanded={p.fabOpen}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "18px",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(150deg,var(--green),var(--green-d))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 14px 28px -12px var(--green)",
            transform: p.fabOpen ? "rotate(45deg)" : "none",
            transition: "transform .25s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <PlusIcon size={26} sw={2.4} />
        </button>
      </div>
    </div>
  )
}

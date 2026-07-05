"use client"

import { usePayments } from "./use-payments"
import { CalendarBig, PlusIcon } from "./icons"

export function PaymentsEmpty() {
  const p = usePayments()

  return (
    <div
      className="px-5 py-10 md:py-16"
      style={{ textAlign: "center", border: "1.5px dashed var(--line)", borderRadius: "18px", background: "var(--paper)" }}
    >
      <div
        className="mx-auto mb-4 flex items-center justify-center"
        style={{ width: "66px", height: "66px", borderRadius: "20px", background: "var(--green-bg)", color: "var(--green)" }}
      >
        <CalendarBig size={30} />
      </div>
      <div className="font-heading" style={{ fontWeight: 800, fontSize: "16px" }}>
        {p.emptyCopy.title}
      </div>
      <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "6px", maxWidth: "340px", marginInline: "auto", lineHeight: 1.7 }}>
        {p.emptyCopy.body}
      </div>
      <button
        type="button"
        onClick={() => p.openAdd("variable")}
        className="print:hidden"
        style={{
          marginTop: "18px",
          height: "46px",
          padding: "0 22px",
          borderRadius: "12px",
          border: "none",
          background: "var(--green)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          cursor: "pointer",
        }}
      >
        <PlusIcon size={18} />
        إضافة دفعة
      </button>
    </div>
  )
}

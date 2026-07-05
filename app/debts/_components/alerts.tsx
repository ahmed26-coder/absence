"use client"

import type { ReactNode } from "react"

import { usePayments } from "./use-payments"
import { AlertTriangle, ClockIcon, XIcon } from "./icons"

function AlertBanner({
  tone,
  toneBg,
  iconBg,
  title,
  body,
  icon,
  onDismiss,
  pulse = false,
}: {
  tone: string
  toneBg: string
  iconBg: string
  title: string
  body: string
  icon: ReactNode
  onDismiss: () => void
  pulse?: boolean
}) {
  return (
    <div
      role="status"
      className="mb-3 motion-safe:animate-[payFade_.2s_ease]"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: toneBg,
        border: `1px solid ${tone === "var(--rose)" ? "oklch(0.53 0.16 25 / .22)" : "oklch(0.63 0.09 76 / .28)"}`,
        borderRadius: "14px",
        padding: "12px 13px",
        animation: pulse ? "payPulse 2.6s ease-in-out infinite" : undefined,
      }}
    >
      <div
        style={{
          flex: "none",
          width: "32px",
          height: "32px",
          borderRadius: "9px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tone,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: "13.5px", color: tone === "var(--rose)" ? "oklch(0.42 0.15 25)" : "var(--gold-d)" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "2px" }}>{body}</div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="إغلاق التنبيه"
        style={{ flex: "none", color: tone, background: "none", border: "none", padding: "4px", cursor: "pointer" }}
      >
        <XIcon size={16} />
      </button>
    </div>
  )
}

export function PaymentsAlerts() {
  const p = usePayments()
  if (p.view !== "month") return null

  return (
    <div className="print:hidden">
      {p.alerts.showArrears && (
        <AlertBanner
          tone="var(--rose)"
          toneBg="var(--rose-bg)"
          iconBg="oklch(0.53 0.16 25 / .12)"
          title="توجد متأخرات هذا الشهر"
          body={p.alerts.arrearsText}
          icon={<AlertTriangle size={18} />}
          onDismiss={p.dismissArrears}
        />
      )}
      {p.alerts.showDueSoon && (
        <AlertBanner
          tone="var(--gold-d)"
          toneBg="var(--gold-bg)"
          iconBg="oklch(0.63 0.09 76 / .16)"
          title="اقترب موعد الاستحقاق"
          body={p.alerts.dueSoonText}
          icon={<ClockIcon size={18} />}
          onDismiss={p.dismissDueSoon}
          pulse
        />
      )}
    </div>
  )
}

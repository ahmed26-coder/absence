"use client"

import type { CSSProperties, ReactNode } from "react"

import { formatMoney } from "@/lib/payments/logic"
import { usePayments } from "./use-payments"
import {
  AlertTriangle,
  CoinsIcon,
  DiamondMark,
  HalfPie,
  RemainingIcon,
  TrendingUp,
} from "./icons"

function Ring({ rate, size, inner }: { rate: number; size: number; inner: number }) {
  const big = size > 70
  return (
    <div
      style={{
        flex: "none",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `conic-gradient(#fff ${rate * 3.6}deg, oklch(1 0 0 / .18) 0deg)`,
      }}
    >
      <div
        style={{
          width: `${inner}px`,
          height: `${inner}px`,
          borderRadius: "50%",
          background: "var(--green-d)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <span style={{ fontSize: big ? "19px" : "16px", fontWeight: 800, lineHeight: 1 }}>{rate}٪</span>
        <span style={{ fontSize: big ? "8.5px" : "7.5px", opacity: 0.85, marginTop: "2px" }}>التحصيل</span>
      </div>
    </div>
  )
}

const paperTile: CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: "15px",
  padding: "11px 12px",
}

function Tile({
  icon,
  color,
  label,
  value,
  valueColor,
  radius = "15px",
  valueSize = "19px",
  pad = "11px 12px",
}: {
  icon: ReactNode
  color: string
  label: string
  value: string
  valueColor?: string
  radius?: string
  valueSize?: string
  pad?: string
}) {
  return (
    <div style={{ ...paperTile, borderRadius: radius, padding: pad }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color }}>
        {icon}
        <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--ink2)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "6px" }}>
        <span style={{ fontWeight: 800, fontSize: valueSize, color: valueColor ?? "var(--ink)" }}>{value}</span>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>ج.م</span>
      </div>
    </div>
  )
}

function MiniStat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ background: "oklch(1 0 0 / .12)", borderRadius: "11px", padding: "8px 9px" }}>
      <div style={{ fontSize: "10.5px", opacity: 0.82 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: "15px", marginTop: "2px", color: valueColor ?? "#fff" }}>{value}</div>
    </div>
  )
}

export function PaymentsSummary() {
  const p = usePayments()
  const s = p.summary
  const overdueTone = s.overdue > 0 ? "oklch(0.9 0.06 40)" : "#fff"

  return (
    <div>
      {/* ===== mobile: hero (with inline stats) + 2x2 tiles ===== */}
      <div className="md:hidden">
        <div
          style={{
            position: "relative",
            borderRadius: "22px",
            overflow: "hidden",
            background: "linear-gradient(158deg,var(--green) 0%,var(--green-d) 100%)",
            color: "#fff",
            padding: "17px 17px 16px",
            boxShadow: "0 18px 34px -20px var(--green)",
          }}
        >
          <div style={{ position: "absolute", top: "-38px", insetInlineStart: "-30px", opacity: 0.09, color: "#fff" }}>
            <DiamondMark size={150} />
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", opacity: 0.85, fontWeight: 600 }}>
                الوارد فعليًا · {p.monthLabel}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginTop: "5px" }}>
                <span style={{ fontSize: "33px", fontWeight: 800, letterSpacing: "-.5px" }}>{formatMoney(s.incoming)}</span>
                <span style={{ fontSize: "13px", opacity: 0.85, fontWeight: 600 }}>ج.م</span>
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.8, marginTop: "2px" }}>
                من إجمالي متوقع {formatMoney(s.expected)} ج.م
              </div>
            </div>
            <Ring rate={s.rate} size={78} inner={60} />
          </div>
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "7px",
              marginTop: "14px",
            }}
          >
            <MiniStat label="المتبقي" value={formatMoney(s.remaining)} />
            <MiniStat label="المتأخر" value={formatMoney(s.overdue)} valueColor={overdueTone} />
            <MiniStat label="صافي الشهر" value={formatMoney(s.net)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px", marginTop: "10px" }}>
          <Tile icon={<CoinsIcon size={15} />} color="var(--gold-d)" label="إجمالي المتوقع" value={formatMoney(s.expected)} />
          <Tile icon={<HalfPie size={15} />} color="var(--amber)" label="المدفوع جزئيًا" value={formatMoney(s.partialSum)} />
          <Tile icon={<AlertTriangle size={15} />} color="var(--rose)" label="إجمالي المتأخر" value={formatMoney(s.overdue)} />
          <Tile icon={<TrendingUp size={15} />} color="var(--green)" label="المصروفات" value={formatMoney(s.expenses)} />
        </div>
      </div>

      {/* ===== desktop: hero + 5 stat cards ===== */}
      <div
        className="hidden md:grid"
        style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", gap: "11px" }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "18px",
            background: "linear-gradient(150deg,var(--green),var(--green-d))",
            color: "#fff",
            padding: "16px 17px",
            boxShadow: "0 14px 28px -18px var(--green)",
          }}
        >
          <div style={{ position: "absolute", top: "-30px", insetInlineStart: "-24px", opacity: 0.1, color: "#fff" }}>
            <DiamondMark size={120} />
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", opacity: 0.85, fontWeight: 600 }}>الوارد فعليًا</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "6px" }}>
                <span style={{ fontSize: "29px", fontWeight: 800 }}>{formatMoney(s.incoming)}</span>
                <span style={{ fontSize: "12px", opacity: 0.85 }}>ج.م</span>
              </div>
              <div style={{ fontSize: "11px", opacity: 0.8, marginTop: "3px" }}>من {formatMoney(s.expected)} متوقع</div>
            </div>
            <Ring rate={s.rate} size={66} inner={50} />
          </div>
        </div>
        <Tile icon={<CoinsIcon size={15} />} color="var(--gold-d)" label="المتوقع" value={formatMoney(s.expected)} radius="16px" valueSize="21px" pad="14px 15px" />
        <Tile icon={<RemainingIcon size={15} />} color="var(--ink2)" label="المتبقي" value={formatMoney(s.remaining)} radius="16px" valueSize="21px" pad="14px 15px" />
        <Tile icon={<AlertTriangle size={15} />} color="var(--rose)" label="المتأخر" value={formatMoney(s.overdue)} radius="16px" valueSize="21px" pad="14px 15px" />
        <Tile icon={<HalfPie size={15} />} color="var(--amber)" label="جزئي" value={formatMoney(s.partialSum)} radius="16px" valueSize="21px" pad="14px 15px" />
        <Tile icon={<TrendingUp size={15} />} color="var(--green)" label="صافي الشهر" value={formatMoney(s.net)} valueColor="var(--green-d)" radius="16px" valueSize="21px" pad="14px 15px" />
      </div>

      {/* islamic divider (mobile only, before the tabs) */}
      <div className="mt-4 mb-3 flex items-center gap-2.5 md:hidden">
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,var(--line))" }} />
        <span style={{ color: "var(--gold)", opacity: 0.7, display: "flex" }}>
          <DiamondMark size={13} />
        </span>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(270deg,transparent,var(--line))" }} />
      </div>
    </div>
  )
}

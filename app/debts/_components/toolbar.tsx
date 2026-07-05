"use client"

import type { CSSProperties } from "react"

import { usePayments } from "./use-payments"
import { seg, segGroup, iconBtn, primaryBtn } from "./styles"
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExportIcon,
  FileIcon,
  FilterIcon,
  HomeIcon,
  PlusIcon,
  PrintIcon,
} from "./icons"

const stepBtn: CSSProperties = {
  width: "40px",
  height: "44px",
  flex: "none",
  borderRadius: "12px",
  border: "1px solid var(--line)",
  background: "var(--paper)",
  color: "var(--ink2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

export function PaymentsToolbar() {
  const p = usePayments()

  return (
    <div className="mb-4 space-y-3">
      {/* title + actions */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-[21px] font-bold leading-none text-[var(--ink)] md:text-2xl">
            المدفوعات
          </h1>
          <p className="mt-1 text-[11.5px] font-semibold text-[var(--muted)] md:text-[13px]">
            متابعة الوارد والمصروفات شهريًا
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => p.openAdd("variable")}
            className="hidden md:inline-flex"
            style={{
              ...primaryBtn,
              height: "44px",
              padding: "0 16px",
              borderRadius: "11px",
              fontSize: "13.5px",
              boxShadow: "0 8px 18px -10px var(--green)",
            }}
          >
            <PlusIcon size={17} />
            دفعة
          </button>
          <button
            type="button"
            onClick={() => p.openAdd("fixed")}
            className="hidden md:inline-flex"
            style={{
              height: "44px",
              padding: "0 16px",
              borderRadius: "11px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: "13.5px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "var(--gold-d)", display: "flex" }}>
              <HomeIcon size={16} />
            </span>
            مصدر ثابت
          </button>

          <button
            type="button"
            onClick={() => p.setFilterOpen(true)}
            aria-label="تصفية العمليات"
            className="md:hidden"
            style={iconBtn(40)}
          >
            <FilterIcon size={19} />
            {p.filterActive && (
              <span
                style={{
                  position: "absolute",
                  top: "8px",
                  insetInlineStart: "8px",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--green)",
                  border: "1.5px solid var(--paper)",
                }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => p.setExportOpen(true)}
            aria-label="تصدير أو طباعة"
            className="md:hidden"
            style={iconBtn(40)}
          >
            <ExportIcon size={19} />
          </button>
          <button
            type="button"
            onClick={p.exportPdf}
            aria-label="تصدير ملف PDF"
            className="hidden md:inline-flex"
            style={iconBtn(44)}
          >
            <FileIcon size={19} />
          </button>
          <button
            type="button"
            onClick={p.printStatement}
            aria-label="طباعة الكشف"
            className="hidden md:inline-flex"
            style={iconBtn(44)}
          >
            <PrintIcon size={19} />
          </button>
        </div>
      </div>

      {/* month nav + view/calendar toggles */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button type="button" onClick={p.prevMonth} aria-label="الشهر السابق" style={stepBtn}>
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => p.setPickerOpen(true)}
          aria-label={`اختيار الشهر، الحالي ${p.monthLabel}`}
          className="flex-1 md:flex-none"
          style={{
            height: "44px",
            minWidth: "180px",
            borderRadius: "11px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <span style={{ color: "var(--green)", display: "flex" }}>
            <CalendarIcon size={17} />
          </span>
          <span style={{ fontWeight: 800, fontSize: "15.5px", color: "var(--ink)" }}>
            {p.monthLabel}
          </span>
          <span style={{ color: "var(--muted)", display: "flex" }}>
            <ChevronDown size={14} />
          </span>
        </button>
        <button type="button" onClick={p.nextMonth} aria-label="الشهر التالي" style={stepBtn}>
          <ChevronLeft size={18} />
        </button>

        <div style={segGroup} className="flex-1 md:flex-none">
          <button type="button" onClick={() => p.setView("month")} style={{ ...seg(p.view === "month"), flex: 1 }}>
            الشهر
          </button>
          <button type="button" onClick={() => p.setView("year")} style={{ ...seg(p.view === "year"), flex: 1 }}>
            السنة
          </button>
        </div>
        <div style={segGroup}>
          <button type="button" onClick={() => p.setCalendar("greg")} style={seg(p.calendar === "greg")}>
            ميلادي
          </button>
          <button type="button" onClick={() => p.setCalendar("hijri")} style={seg(p.calendar === "hijri")}>
            هجري
          </button>
        </div>
      </div>
    </div>
  )
}

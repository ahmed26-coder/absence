"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"

import { useToast } from "@/components/ui/toast-provider"
import {
  addEntry,
  createPayment,
  deletePayment,
  quickConfirm,
  toggleCancel,
} from "@/lib/payments/actions"
import { EMPTY_COPY, INCOME_CATS, EXPENSE_CATS, TAB_DEFS } from "@/lib/payments/constants"
import {
  buildYearOverview,
  computeSummary,
  formatMoney,
  monthLabel,
  paidOf,
  passesFilter,
  referenceDay,
  remainingOf,
  sortItems,
  statusOf,
  yearNumber,
} from "@/lib/payments/logic"
import type {
  AddForm,
  Calendar,
  FilterKey,
  Flow,
  Kind,
  Payment,
  SortKey,
  ViewMode,
} from "@/lib/payments/types"

export interface TodayInfo {
  year: number
  month: number // 0-based
  day: number
}

function parseAmount(raw: number | string): number {
  return Math.round(Number(String(raw).replace(/[^\d.]/g, "")))
}

function emptyAddForm(flow: Flow, kind: Kind, day: number): AddForm {
  return {
    flow,
    kind,
    name: "",
    category: (flow === "income" ? INCOME_CATS : EXPENSE_CATS)[0],
    expected: "",
    dueDay: day,
    note: "",
  }
}

function usePaymentsController(initialItems: Payment[], today: TodayInfo) {
  const { pushToast } = useToast()
  const [items, setItems] = useState<Payment[]>(initialItems)
  const [isPending, startTransition] = useTransition()

  // view config
  const [view, setView] = useState<ViewMode>("month")
  const [calendar, setCalendar] = useState<Calendar>("greg")
  const [monthIndex, setMonthIndex] = useState<number>(today.month)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [sortBy, setSortBy] = useState<SortKey>("priority")

  // ephemeral UI
  const [openId, setOpenId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<AddForm | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [detailDraft, setDetailDraft] = useState("")
  const [errorId, setErrorId] = useState<string | null>(null)
  const [arrearsDismissed, setArrearsDismissed] = useState(false)
  const [dueSoonDismissed, setDueSoonDismissed] = useState(false)

  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flashError = useCallback(
    (id: string, msg: string) => {
      setErrorId(id)
      if (errorTimer.current) clearTimeout(errorTimer.current)
      errorTimer.current = setTimeout(() => setErrorId(null), 1900)
      pushToast(msg, "error")
    },
    [pushToast],
  )

  const replaceItem = useCallback((p: Payment) => {
    setItems((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }, [])

  // ---- derived ----
  const refDay = referenceDay(today.year, monthIndex, today.year, today.month, today.day)
  const monthItems = useMemo(
    () => items.filter((it) => it.periodMonth === monthIndex),
    [items, monthIndex],
  )
  const summary = useMemo(() => computeSummary(monthItems, refDay), [monthItems, refDay])

  const tabs = useMemo(
    () =>
      TAB_DEFS.map((t) => ({
        ...t,
        active: filter === t.key,
        count: monthItems.filter((i) => passesFilter(i, t.key, refDay)).length,
      })),
    [monthItems, filter, refDay],
  )

  const visibleItems = useMemo(
    () => sortItems(monthItems.filter((i) => passesFilter(i, filter, refDay)), sortBy, refDay),
    [monthItems, filter, sortBy, refDay],
  )

  const alerts = useMemo(() => {
    const overdueItems = monthItems.filter(
      (i) => !i.cancelled && i.dueDay < refDay && paidOf(i) < i.expected,
    )
    const dueSoonItems = monthItems.filter(
      (i) =>
        i.flow === "income" &&
        !i.cancelled &&
        paidOf(i) < i.expected &&
        // refDay===0 means a future month that hasn't started; nothing is "due
        // soon" there. Only flag the current month (refDay = today's day).
        refDay > 0 &&
        i.dueDay >= refDay &&
        i.dueDay <= refDay + 2,
    )
    const showArrears = overdueItems.length > 0 && !arrearsDismissed && view === "month"
    const showDueSoon =
      dueSoonItems.length > 0 && !dueSoonDismissed && view === "month" && !showArrears
    const mName = monthLabel(monthIndex, calendar, today.year).split(" ")[0]
    return {
      showArrears,
      showDueSoon,
      arrearsText: `عدد ${overdueItems.length} عملية بقيمة ${formatMoney(summary.overdue)} ج.م فات موعد استحقاقها.`,
      dueSoonText: dueSoonItems.length
        ? `«${dueSoonItems[0].name}» يستحق يوم ${dueSoonItems[0].dueDay} ${mName}${
            dueSoonItems.length > 1 ? ` و${dueSoonItems.length - 1} غيرها` : ""
          }.`
        : "",
    }
  }, [monthItems, refDay, arrearsDismissed, dueSoonDismissed, view, summary.overdue, monthIndex, calendar, today.year])

  const yearOverview = useMemo(
    () => buildYearOverview(items, today, calendar),
    [items, today, calendar],
  )

  const emptyCopy = EMPTY_COPY[filter] ?? EMPTY_COPY.all
  const openItem = items.find((i) => i.id === openId) ?? null

  // ---- mutations ----
  const applyEntry = useCallback(
    (id: string, raw: string, fromDetail: boolean) => {
      const amt = parseAmount(raw)
      if (!amt || amt <= 0) {
        pushToast("أدخل مبلغًا صحيحًا", "error")
        return
      }
      const it = items.find((i) => i.id === id)
      if (!it) return
      const rem = remainingOf(it)
      if (amt > rem) {
        flashError(id, `المبلغ أكبر من المتبقي (${formatMoney(rem)} ج.م)`)
        return
      }
      startTransition(async () => {
        const res = await addEntry(id, amt)
        if (!res.ok) {
          flashError(id, res.error)
          return
        }
        replaceItem(res.payment)
        if (fromDetail) setDetailDraft("")
        else setDrafts((d) => ({ ...d, [id]: "" }))
        const done = paidOf(res.payment) >= res.payment.expected
        pushToast(
          done ? "اكتمل المبلغ ✓ الحالة الآن مدفوع بالكامل" : `تم تسجيل دفعة ${formatMoney(amt)} ج.م`,
          "success",
        )
      })
    },
    [items, pushToast, flashError, replaceItem],
  )

  const quickToggle = useCallback(
    (id: string) => {
      const it = items.find((i) => i.id === id)
      if (!it || it.cancelled) return
      const wasFull = paidOf(it) >= it.expected
      startTransition(async () => {
        const res = await quickConfirm(id)
        if (!res.ok) {
          pushToast(res.error, "error")
          return
        }
        replaceItem(res.payment)
        pushToast(
          wasFull ? "تم التراجع عن التأكيد" : "تم تأكيد وصول الدفعة كاملة",
          wasFull ? "default" : "success",
        )
      })
    },
    [items, pushToast, replaceItem],
  )

  const toggleCancelOpen = useCallback(() => {
    if (!openId) return
    startTransition(async () => {
      const res = await toggleCancel(openId)
      if (!res.ok) {
        pushToast(res.error, "error")
        return
      }
      replaceItem(res.payment)
      pushToast(res.payment.cancelled ? "تم إلغاء العملية" : "تم إعادة تفعيل العملية", "default")
    })
  }, [openId, pushToast, replaceItem])

  const doDelete = useCallback(() => {
    const id = confirmId
    if (!id) return
    const name = items.find((i) => i.id === id)?.name ?? ""
    startTransition(async () => {
      const res = await deletePayment(id)
      if (!res.ok) {
        pushToast(res.error ?? "تعذّر حذف العملية", "error")
        return
      }
      setItems((prev) => prev.filter((x) => x.id !== id))
      setConfirmId(null)
      setOpenId(null)
      pushToast(`تم حذف «${name}»`, "default")
    })
  }, [confirmId, items, pushToast])

  const submitAdd = useCallback(() => {
    const f = addForm
    if (!f) return
    if (!f.name.trim()) {
      pushToast("أدخل اسم الدافع أو المصدر", "error")
      return
    }
    const exp = parseAmount(f.expected)
    if (!exp || exp <= 0) {
      pushToast("أدخل مبلغًا متوقعًا صحيحًا", "error")
      return
    }
    startTransition(async () => {
      const res = await createPayment({
        name: f.name,
        flow: f.flow,
        kind: f.kind,
        category: f.category,
        expected: exp,
        dueDay: f.dueDay,
        note: f.note,
        periodYear: today.year,
        periodMonth: monthIndex,
      })
      if (!res.ok) {
        pushToast(res.error, "error")
        return
      }
      setItems((prev) => [res.payment, ...prev])
      setAddForm(null)
      setFilter("all")
      pushToast(`تمت إضافة «${res.payment.name}»`, "success")
    })
  }, [addForm, pushToast, today.year, monthIndex])

  // ---- sheet openers ----
  const openAdd = useCallback(
    (kind: Kind = "variable") => {
      setAddForm(emptyAddForm("income", kind, today.day))
      setFabOpen(false)
      setOpenId(null)
    },
    [today.day],
  )
  const closeOverlays = useCallback(() => {
    setPickerOpen(false)
    setFilterOpen(false)
    setExportOpen(false)
    setFabOpen(false)
  }, [])

  // Export/print use the browser print dialog — it renders Arabic correctly and
  // offers "Save as PDF", unlike a client-side PDF encoder.
  const printStatement = useCallback(() => {
    setExportOpen(false)
    pushToast("جارٍ فتح نافذة الطباعة…", "default")
    if (typeof window !== "undefined") window.setTimeout(() => window.print(), 60)
  }, [pushToast])
  const exportPdf = useCallback(() => {
    setExportOpen(false)
    pushToast('اختر "الحفظ كـ PDF" من نافذة الطباعة', "default")
    if (typeof window !== "undefined") window.setTimeout(() => window.print(), 60)
  }, [pushToast])

  const anyPhoneOverlay = pickerOpen || filterOpen || exportOpen || fabOpen

  return {
    // data + status
    items,
    isPending,
    today,
    // view config
    view,
    setView,
    calendar,
    setCalendar,
    monthIndex,
    setMonthIndex,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    prevMonth: () => setMonthIndex((m) => (m + 11) % 12),
    nextMonth: () => setMonthIndex((m) => (m + 1) % 12),
    monthLabel: monthLabel(monthIndex, calendar, today.year),
    monthNameOnly: monthLabel(monthIndex, calendar, today.year).split(" ")[0],
    yearOnly: yearNumber(calendar, today.year),
    calLabel: calendar === "hijri" ? "هجري" : "ميلادي",
    // derived
    refDay,
    monthItems,
    summary,
    tabs,
    visibleItems,
    alerts,
    yearOverview,
    emptyCopy,
    filterActive: filter !== "all",
    // sheets / ui state
    openId,
    setOpenId,
    openItem,
    addForm,
    setAddForm,
    confirmId,
    setConfirmId,
    pickerOpen,
    setPickerOpen,
    filterOpen,
    setFilterOpen,
    exportOpen,
    setExportOpen,
    fabOpen,
    setFabOpen,
    drafts,
    setDrafts,
    detailDraft,
    setDetailDraft,
    errorId,
    arrearsDismissed,
    dueSoonDismissed,
    dismissArrears: () => setArrearsDismissed(true),
    dismissDueSoon: () => setDueSoonDismissed(true),
    anyPhoneOverlay,
    closeOverlays,
    openAdd,
    printStatement,
    exportPdf,
    // mutations
    applyEntry,
    quickToggle,
    toggleCancelOpen,
    doDelete,
    submitAdd,
  }
}

export type PaymentsController = ReturnType<typeof usePaymentsController>

const PaymentsContext = createContext<PaymentsController | null>(null)

export function PaymentsProvider({
  initialItems,
  today,
  children,
}: {
  initialItems: Payment[]
  today: TodayInfo
  children: React.ReactNode
}) {
  const value = usePaymentsController(initialItems, today)
  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>
}

export function usePayments(): PaymentsController {
  const ctx = useContext(PaymentsContext)
  if (!ctx) throw new Error("usePayments must be used within PaymentsProvider")
  return ctx
}

// re-exported so components share the same status/derivation helpers
export { statusOf, paidOf, remainingOf }

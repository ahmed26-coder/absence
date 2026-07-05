import { GREG_MONTHS, HIJRI_MONTHS, GREG_YEAR, HIJRI_YEAR } from "./constants"
import type {
  Calendar,
  FilterKey,
  Payment,
  PaymentStatus,
  PaymentSummary,
  SortKey,
} from "./types"

/** Western-digit integer with thousands separators (matches the design). */
export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n || 0))
}

export function paidOf(p: Payment): number {
  return p.entries.reduce((sum, e) => sum + e.amount, 0)
}

export function remainingOf(p: Payment): number {
  return Math.max(0, p.expected - paidOf(p))
}

export function progressOf(p: Payment): number {
  if (p.expected <= 0) return 0
  return Math.min(100, Math.round((paidOf(p) / p.expected) * 100))
}

/**
 * Status for a given reference day-of-month. `refDay` lets the caller model
 * whether the viewed period is in the past (everything due), the future
 * (nothing due yet) or the current month (compare against today's day).
 */
export function statusOf(p: Payment, refDay: number): PaymentStatus {
  if (p.cancelled) return "cancelled"
  const paid = paidOf(p)
  if (paid >= p.expected) return "full"
  if (paid > 0) return "partial"
  if (p.dueDay > refDay) return "notdue"
  if (p.dueDay < refDay) return "overdue"
  return "unpaid"
}

const RANK: Record<PaymentStatus, number> = {
  overdue: 0,
  unpaid: 1,
  partial: 2,
  notdue: 3,
  full: 4,
  cancelled: 5,
}

export function rankOf(p: Payment, refDay: number): number {
  return RANK[statusOf(p, refDay)]
}

export function isOverdue(p: Payment, refDay: number): boolean {
  return !p.cancelled && p.dueDay < refDay && paidOf(p) < p.expected
}

/** Whether a transaction matches a filter tab. */
export function passesFilter(p: Payment, key: FilterKey, refDay: number): boolean {
  switch (key) {
    case "all":
      return true
    case "fixed":
      return p.flow === "income" && p.kind === "fixed"
    case "variable":
      return p.flow === "income" && p.kind === "variable"
    case "expense":
      return p.flow === "expense"
    case "partial":
      return statusOf(p, refDay) === "partial"
    case "overdue":
      return isOverdue(p, refDay)
    default:
      return true
  }
}

export function sortItems(items: Payment[], sortBy: SortKey, refDay: number): Payment[] {
  const copy = [...items]
  if (sortBy === "amount") return copy.sort((a, b) => b.expected - a.expected)
  if (sortBy === "due") return copy.sort((a, b) => a.dueDay - b.dueDay)
  return copy.sort((a, b) => rankOf(a, refDay) - rankOf(b, refDay) || a.dueDay - b.dueDay)
}

/** Aggregate month figures for the hero + stat tiles. */
export function computeSummary(items: Payment[], refDay: number): PaymentSummary {
  let expected = 0
  let incoming = 0
  let partialSum = 0
  let overdue = 0
  let expenses = 0

  for (const it of items) {
    if (it.cancelled) continue
    const paid = paidOf(it)
    if (it.flow === "income") {
      expected += it.expected
      incoming += paid
      if (statusOf(it, refDay) === "partial") partialSum += paid
      if (it.dueDay < refDay) overdue += Math.max(0, it.expected - paid)
    } else {
      expenses += paid
    }
  }

  const remaining = Math.max(0, expected - incoming)
  const rate = expected > 0 ? Math.round((incoming / expected) * 100) : 0
  const net = incoming - expenses
  return { expected, incoming, remaining, overdue, partialSum, net, expenses, rate }
}

export function monthName(monthIndex: number, calendar: Calendar): string {
  return (calendar === "hijri" ? HIJRI_MONTHS : GREG_MONTHS)[monthIndex]
}

export function yearNumber(calendar: Calendar): number {
  return calendar === "hijri" ? HIJRI_YEAR : GREG_YEAR
}

export function monthLabel(monthIndex: number, calendar: Calendar): string {
  return `${monthName(monthIndex, calendar)} ${yearNumber(calendar)}`
}

/**
 * The reference day for a viewed period relative to the real current date:
 * past months are fully due (31), future months are not due (0), the current
 * month compares against today's day-of-month.
 */
export function referenceDay(
  viewYear: number,
  viewMonth: number,
  todayYear: number,
  todayMonth: number,
  todayDay: number,
): number {
  if (viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth)) return 31
  if (viewYear > todayYear || (viewYear === todayYear && viewMonth > todayMonth)) return 0
  return todayDay
}

export type YearTag = "current" | "upcoming" | "arrears" | "complete"

export interface YearCell {
  monthIndex: number
  name: string
  expected: number
  incoming: number
  remaining: number
  rate: number
  tag: YearTag
  isCurrent: boolean
  isFuture: boolean
}

export interface YearOverview {
  cells: YearCell[]
  rate: number
}

/**
 * Aggregates income collection per month across the loaded year for the year
 * overview grid. `today` fixes which months are past/current/future.
 */
export function buildYearOverview(
  items: Payment[],
  currentMonthIndex: number,
  today: { year: number; month: number; day: number },
  calendar: Calendar,
): YearOverview {
  let totalExpected = 0
  let totalIncoming = 0
  const cells: YearCell[] = []

  for (let mi = 0; mi < 12; mi++) {
    const monthItems = items.filter((it) => it.periodMonth === mi)
    const refDay = referenceDay(today.year, mi, today.year, today.month, today.day)
    const summary = computeSummary(monthItems, refDay)
    totalExpected += summary.expected
    totalIncoming += summary.incoming

    const isCurrent = mi === currentMonthIndex
    const isFuture = summary.expected === 0
    let tag: YearTag
    if (isCurrent) tag = "current"
    else if (isFuture) tag = "upcoming"
    else if (summary.remaining > 0) tag = "arrears"
    else tag = "complete"

    cells.push({
      monthIndex: mi,
      name: monthName(mi, calendar),
      expected: summary.expected,
      incoming: summary.incoming,
      remaining: summary.remaining,
      rate: summary.rate,
      tag,
      isCurrent,
      isFuture,
    })
  }

  const rate = totalExpected > 0 ? Math.round((totalIncoming / totalExpected) * 100) : 0
  return { cells, rate }
}

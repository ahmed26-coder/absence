import { STATUS_META } from "@/lib/payments/constants"
import { formatMoney, paidOf, progressOf, remainingOf, statusOf } from "@/lib/payments/logic"
import type { Payment } from "@/lib/payments/types"

export interface ItemView {
  status: ReturnType<typeof statusOf>
  statusLabel: string
  dotColor: string
  barColor: string
  badgeBg: string
  badgeFg: string
  flowLabel: string
  kindLabel: string
  flowBg: string
  flowFg: string
  expected: string
  paid: string
  remaining: string
  remainingNum: number
  pct: number
  dueLabel: string
  isFull: boolean
  isCancelled: boolean
  hasError: boolean
  remTone: string
  dueTone: string
  showProgress: boolean
  showPartial: boolean
  showActions: boolean
  quickChecked: boolean
}

/** Presentation-ready fields for one transaction. Pure — safe to call in render. */
export function deriveItem(
  it: Payment,
  refDay: number,
  monthNameOnly: string,
  errorId: string | null,
): ItemView {
  const status = statusOf(it, refDay)
  const meta = STATUS_META[status]
  const paid = paidOf(it)
  const rem = remainingOf(it)
  const isFull = status === "full"
  const isCancelled = status === "cancelled"
  return {
    status,
    statusLabel: meta.label,
    dotColor: meta.dot,
    barColor: meta.bar,
    badgeBg: meta.bg,
    badgeFg: meta.fg,
    flowLabel: it.flow === "income" ? "دخل" : "مصروف",
    kindLabel: it.kind === "fixed" ? "ثابت" : "متغير",
    flowBg: it.flow === "income" ? "var(--green-bg)" : "var(--slate-bg)",
    flowFg: it.flow === "income" ? "var(--green-d)" : "var(--slate)",
    expected: formatMoney(it.expected),
    paid: formatMoney(paid),
    remaining: formatMoney(rem),
    remainingNum: rem,
    pct: progressOf(it),
    dueLabel: `${it.dueDay} ${monthNameOnly}`,
    isFull,
    isCancelled,
    hasError: errorId === it.id,
    remTone: rem > 0 ? "var(--ink)" : "var(--muted)",
    dueTone: status === "overdue" ? "var(--rose)" : status === "notdue" ? "var(--muted)" : "var(--ink2)",
    showProgress: paid > 0 && !isFull && !isCancelled,
    showPartial: !isFull && !isCancelled,
    showActions: !isCancelled,
    quickChecked: isFull,
  }
}

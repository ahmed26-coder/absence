// Domain types for the Payments (المدفوعات) finance module.

export type Flow = "income" | "expense"
export type Kind = "fixed" | "variable"
export type Calendar = "greg" | "hijri"
export type ViewMode = "month" | "year"

/** Derived lifecycle status of a transaction for a given reference day. */
export type PaymentStatus =
  | "full"
  | "partial"
  | "unpaid"
  | "overdue"
  | "notdue"
  | "cancelled"

export type FilterKey = "all" | "fixed" | "variable" | "expense" | "partial" | "overdue"
export type SortKey = "priority" | "due" | "amount"

/** A single partial payment recorded against a transaction. */
export interface PaymentEntry {
  id: string
  amount: number
  day: number
  note: string
  isQuick: boolean
}

/** An audit-timeline line ("سجل التعديلات"). */
export interface PaymentEvent {
  id: string
  text: string
  day: number
}

/** A transaction: a source of income, or an expense, for one month. */
export interface Payment {
  id: string
  name: string
  flow: Flow
  kind: Kind
  category: string
  expected: number
  dueDay: number
  periodYear: number
  periodMonth: number
  note: string
  cancelled: boolean
  entries: PaymentEntry[]
  events: PaymentEvent[]
}

/** The month-summary figures shown in the hero + stat tiles. */
export interface PaymentSummary {
  expected: number
  incoming: number
  remaining: number
  overdue: number
  partialSum: number
  net: number
  expenses: number
  rate: number
}

/** The add/edit form state. `expected` is a raw string while typing. */
export interface AddForm {
  flow: Flow
  kind: Kind
  name: string
  category: string
  expected: string
  dueDay: number
  note: string
}

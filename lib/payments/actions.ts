"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/app/auth/actions"
import { formatMoney } from "./logic"
import { mapPayment } from "./queries"
import { EXPENSE_CATS, INCOME_CATS } from "./constants"
import type { Flow, Kind, Payment } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ActionResult =
  | { ok: true; payment: Payment }
  | { ok: false; error: string }

export interface CreatePaymentInput {
  name: string
  flow: Flow
  kind: Kind
  category: string
  expected: number | string
  dueDay: number
  note?: string
  periodYear: number
  periodMonth: number
}

const GENERIC_ERROR = "تعذّر إتمام العملية، يرجى المحاولة مرة أخرى"
const OVERPAY_ERROR = "المبلغ أكبر من المتبقي"

/**
 * SQLSTATE raised by the enforce_payment_not_overpaid() trigger (migration 006)
 * when a concurrent entry write would push the paid sum past `expected`. This is
 * the race-loser path: both requests passed the app-level check, but the DB
 * serialized them and rejected the second. Map it to the same friendly message
 * the app-level guard uses instead of a generic failure.
 */
const OVERPAY_SQLSTATE = "PT001"

/** Today's day-of-month in the app timezone — used to stamp entries/events. */
function todayDay(): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    day: "2-digit",
  }).formatToParts(new Date())
  const day = parts.find((p) => p.type === "day")?.value
  return Number(day) || 1
}

function toAmount(raw: number | string): number {
  return Math.round(Number(String(raw).replace(/[^\d.]/g, "")))
}

/** Re-reads a single transaction with its children after a mutation. */
async function fetchPayment(supabase: any, id: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*, payment_entries(*), payment_events(*)")
    .eq("id", id)
    .single()
  if (error || !data) return null
  return mapPayment(data)
}

async function guard(): Promise<{ supabase: any; userId: string } | null> {
  if (!(await isAdmin())) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return { supabase, userId: user.id }
}

export async function createPayment(input: CreatePaymentInput): Promise<ActionResult> {
  const g = await guard()
  if (!g) return { ok: false, error: GENERIC_ERROR }
  const { supabase, userId } = g

  const name = (input.name || "").trim()
  if (!name) return { ok: false, error: "أدخل اسم الدافع أو المصدر" }

  const expected = toAmount(input.expected)
  if (!expected || expected <= 0) return { ok: false, error: "أدخل مبلغًا متوقعًا صحيحًا" }

  const dueDay = Math.min(28, Math.max(1, Math.round(input.dueDay)))
  const flow: Flow = input.flow === "expense" ? "expense" : "income"
  const kind: Kind = input.kind === "fixed" ? "fixed" : "variable"

  // Validate period + category at the trust boundary rather than relying on the
  // DB CHECK constraints (which would surface only as an opaque generic error).
  const periodMonth = Math.round(Number(input.periodMonth))
  if (!Number.isInteger(periodMonth) || periodMonth < 0 || periodMonth > 11) {
    return { ok: false, error: "الشهر غير صالح" }
  }
  const periodYear = Math.round(Number(input.periodYear))
  if (!Number.isInteger(periodYear) || periodYear < 2000 || periodYear > 3000) {
    return { ok: false, error: "السنة غير صالحة" }
  }
  const category = (input.category || "").trim()
  const allowedCats = flow === "income" ? INCOME_CATS : EXPENSE_CATS
  if (!allowedCats.includes(category)) {
    return { ok: false, error: "اختر تصنيفًا صحيحًا" }
  }

  const day = todayDay()

  const { data, error } = await supabase
    .from("payments")
    .insert({
      name,
      flow,
      kind,
      category,
      expected,
      due_day: dueDay,
      period_year: periodYear,
      period_month: periodMonth,
      note: (input.note || "").trim() || null,
      created_by: userId,
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("createPayment error:", error?.code)
    return { ok: false, error: GENERIC_ERROR }
  }

  await supabase.from("payment_events").insert({
    payment_id: data.id,
    text: `إنشاء العملية — المتوقع ${formatMoney(expected)} ج.م`,
    day,
  })

  const payment = await fetchPayment(supabase, data.id)
  if (!payment) return { ok: false, error: GENERIC_ERROR }
  revalidatePath("/debts")
  return { ok: true, payment }
}

export async function addEntry(paymentId: string, rawAmount: number | string): Promise<ActionResult> {
  const g = await guard()
  if (!g) return { ok: false, error: GENERIC_ERROR }
  const { supabase, userId } = g

  const amount = toAmount(rawAmount)
  if (!amount || amount <= 0) return { ok: false, error: "أدخل مبلغًا صحيحًا" }

  const current = await fetchPayment(supabase, paymentId)
  if (!current) return { ok: false, error: GENERIC_ERROR }
  if (current.cancelled) return { ok: false, error: GENERIC_ERROR }

  const paid = current.entries.reduce((s, e) => s + e.amount, 0)
  const remaining = Math.max(0, current.expected - paid)
  if (amount > remaining) {
    return { ok: false, error: `المبلغ أكبر من المتبقي (${formatMoney(remaining)} ج.م)` }
  }

  const day = todayDay()
  const { error } = await supabase.from("payment_entries").insert({
    payment_id: paymentId,
    amount,
    day,
    note: "دفعة جزئية",
    created_by: userId,
  })
  if (error) {
    if (error.code === OVERPAY_SQLSTATE) return { ok: false, error: OVERPAY_ERROR }
    console.error("addEntry error:", error.code)
    return { ok: false, error: GENERIC_ERROR }
  }

  await supabase.from("payment_events").insert({
    payment_id: paymentId,
    text: `تسجيل دفعة ${formatMoney(amount)} ج.م`,
    day,
  })
  if (paid + amount >= current.expected) {
    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      text: "اكتمل المبلغ — الحالة: مدفوع بالكامل",
      day,
    })
  }

  const payment = await fetchPayment(supabase, paymentId)
  if (!payment) return { ok: false, error: GENERIC_ERROR }
  revalidatePath("/debts")
  return { ok: true, payment }
}

/** Marks a transaction fully arrived, or undoes that if already complete. */
export async function quickConfirm(paymentId: string): Promise<ActionResult> {
  const g = await guard()
  if (!g) return { ok: false, error: GENERIC_ERROR }
  const { supabase, userId } = g

  const current = await fetchPayment(supabase, paymentId)
  if (!current) return { ok: false, error: GENERIC_ERROR }
  if (current.cancelled) return { ok: false, error: GENERIC_ERROR }

  const paid = current.entries.reduce((s, e) => s + e.amount, 0)
  const day = todayDay()

  if (paid >= current.expected) {
    const quickIds = current.entries.filter((e) => e.isQuick).map((e) => e.id)
    if (quickIds.length === 0) {
      // Completed by manual partial entries — there is no quick confirmation to
      // undo, so don't delete anything or record a misleading "reverted" event.
      return { ok: true, payment: current }
    }
    await supabase.from("payment_entries").delete().in("id", quickIds)
    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      text: "تراجع عن تأكيد الوصول",
      day,
    })
  } else {
    const rem = current.expected - paid
    const { error } = await supabase.from("payment_entries").insert({
      payment_id: paymentId,
      amount: rem,
      day,
      note: "تأكيد وصول كامل",
      is_quick: true,
      created_by: userId,
    })
    if (error) {
      if (error.code === OVERPAY_SQLSTATE) return { ok: false, error: OVERPAY_ERROR }
      console.error("quickConfirm error:", error.code)
      return { ok: false, error: GENERIC_ERROR }
    }
    await supabase.from("payment_events").insert({
      payment_id: paymentId,
      text: `تأكيد وصول الدفعة كاملة (${formatMoney(rem)} ج.م)`,
      day,
    })
  }

  const payment = await fetchPayment(supabase, paymentId)
  if (!payment) return { ok: false, error: GENERIC_ERROR }
  revalidatePath("/debts")
  return { ok: true, payment }
}

export async function toggleCancel(paymentId: string): Promise<ActionResult> {
  const g = await guard()
  if (!g) return { ok: false, error: GENERIC_ERROR }
  const { supabase } = g

  const current = await fetchPayment(supabase, paymentId)
  if (!current) return { ok: false, error: GENERIC_ERROR }

  const next = !current.cancelled
  const { error } = await supabase.from("payments").update({ cancelled: next }).eq("id", paymentId)
  if (error) {
    console.error("toggleCancel error:", error.code)
    return { ok: false, error: GENERIC_ERROR }
  }
  await supabase.from("payment_events").insert({
    payment_id: paymentId,
    text: next ? "إلغاء العملية" : "إعادة تفعيل العملية",
    day: todayDay(),
  })

  const payment = await fetchPayment(supabase, paymentId)
  if (!payment) return { ok: false, error: GENERIC_ERROR }
  revalidatePath("/debts")
  return { ok: true, payment }
}

export async function deletePayment(paymentId: string): Promise<{ ok: boolean; error?: string }> {
  const g = await guard()
  if (!g) return { ok: false, error: GENERIC_ERROR }
  const { supabase } = g

  const { error } = await supabase.from("payments").delete().eq("id", paymentId)
  if (error) {
    console.error("deletePayment error:", error.code)
    return { ok: false, error: GENERIC_ERROR }
  }
  revalidatePath("/debts")
  return { ok: true }
}

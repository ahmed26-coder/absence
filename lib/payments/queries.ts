import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Payment, PaymentEntry, PaymentEvent } from "./types"

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapEntry(row: any): PaymentEntry {
  return {
    id: row.id,
    amount: Number(row.amount) || 0,
    day: Number(row.day) || 0,
    note: row.note || "",
    isQuick: Boolean(row.is_quick),
  }
}

function mapEvent(row: any): PaymentEvent {
  return { id: row.id, text: row.text || "", day: Number(row.day) || 0 }
}

/** Maps a joined DB row into the domain `Payment`, sorting its children. */
export function mapPayment(row: any): Payment {
  const entries = (row.payment_entries || []).map(mapEntry).sort((a: PaymentEntry, b: PaymentEntry) => a.day - b.day)
  const events = (row.payment_events || []).map(mapEvent).sort((a: PaymentEvent, b: PaymentEvent) => a.day - b.day)
  return {
    id: row.id,
    name: row.name,
    flow: row.flow,
    kind: row.kind,
    category: row.category,
    expected: Number(row.expected) || 0,
    dueDay: Number(row.due_day) || 1,
    periodYear: Number(row.period_year),
    periodMonth: Number(row.period_month),
    note: row.note || "",
    cancelled: Boolean(row.cancelled),
    entries,
    events,
  }
}

/**
 * All transactions for a calendar year, with their entries and events. The
 * whole year is loaded once so month switching and the year overview are
 * instant on the client without refetching.
 */
export async function getPaymentsForYear(
  year: number,
): Promise<{ payments: Payment[]; error: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("payments")
    .select("*, payment_entries(*), payment_events(*)")
    .eq("period_year", year)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("getPaymentsForYear error:", error.code)
    return { payments: [], error: true }
  }

  return { payments: (data || []).map(mapPayment), error: false }
}

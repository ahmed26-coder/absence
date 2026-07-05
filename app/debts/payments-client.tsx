"use client"

import type { Payment } from "@/lib/payments/types"
import { PaymentsProvider, usePayments, type TodayInfo } from "./_components/use-payments"
import { PaymentsToolbar } from "./_components/toolbar"
import { PaymentsAlerts } from "./_components/alerts"
import { PaymentsSummary } from "./_components/summary"
import { PaymentsTabs } from "./_components/tabs"
import { PaymentCard } from "./_components/payment-card"
import { PaymentsTable } from "./_components/payments-table"
import { PaymentsEmpty } from "./_components/empty-state"
import { PaymentsYearView } from "./_components/year-view"
import { DetailSheet } from "./_components/detail-sheet"
import { AddSheet } from "./_components/add-sheet"
import { MonthPicker } from "./_components/month-picker"
import { FilterSheet } from "./_components/filter-sheet"
import { ExportSheet } from "./_components/export-sheet"
import { DeleteConfirm } from "./_components/delete-confirm"
import { PaymentsFab } from "./_components/fab"

function MonthView() {
  const p = usePayments()
  if (p.visibleItems.length === 0) return <PaymentsEmpty />
  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">
        {p.visibleItems.map((it) => (
          <PaymentCard key={it.id} it={it} />
        ))}
      </div>
      <div className="hidden md:block">
        <PaymentsTable />
      </div>
    </>
  )
}

function PaymentsBody() {
  const p = usePayments()
  return (
    <>
      <PaymentsToolbar />
      {p.view === "month" ? (
        <>
          <PaymentsAlerts />
          <PaymentsSummary />
          <PaymentsTabs />
          <MonthView />
        </>
      ) : (
        <PaymentsYearView />
      )}

      <DetailSheet />
      <AddSheet />
      <MonthPicker />
      <FilterSheet />
      <ExportSheet />
      <DeleteConfirm />
      <PaymentsFab />
    </>
  )
}

export default function PaymentsClient({
  initialItems,
  today,
}: {
  initialItems: Payment[]
  today: TodayInfo
}) {
  return (
    <PaymentsProvider initialItems={initialItems} today={today}>
      <div className="pay-scope min-h-[calc(100vh-5rem)]">
        <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-5 md:px-6 md:pb-16 md:pt-6">
          <PaymentsBody />
        </div>
      </div>
    </PaymentsProvider>
  )
}

import { getPaymentsForYear } from "@/lib/payments/queries"
import PaymentsClient from "./payments-client"

export const metadata = {
  title: "المدفوعات - الإدارة",
  description: "متابعة الوارد والمصروفات شهريًا: الاشتراكات والتبرعات والرسوم مقابل المصروفات.",
}

/** Today's date in the app timezone, with a 0-based month to match the UI. */
function cairoToday(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
  const [year, month, day] = parts.split("-").map(Number)
  return { year, month: month - 1, day }
}

export default async function PaymentsPage() {
  const today = cairoToday()
  const { payments, error } = await getPaymentsForYear(today.year)

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-muted/30 p-4 md:p-8" dir="rtl">
        <div className="mx-auto max-w-3xl rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
          <h2 className="mb-1 font-bold">تعذّر تحميل المدفوعات</h2>
          <p className="text-sm">حدث خطأ أثناء جلب البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
        </div>
      </div>
    )
  }

  return <PaymentsClient initialItems={payments} today={today} />
}

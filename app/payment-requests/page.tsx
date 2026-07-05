import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PaymentRequestsClient from "./payment-requests-client"

export const metadata = {
  title: "طلبات الدفع - الإدارة",
  description: "مراجعة واعتماد طلبات سداد الديون من الطلاب",
}

export default async function PaymentRequestsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the pending requests with the student + debt they belong to. Errors
  // are surfaced distinctly from "no pending requests" so a fetch failure never
  // masquerades as an empty queue.
  const { data: requests, error } = await supabase
    .from("payment_requests")
    .select(`
      *,
      student:profiles(full_name, avatar_url),
      debt:debts(id, name, amount_owed, amount_paid)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payment requests:", error.code)
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
            <h2 className="mb-1 font-bold">تعذّر تحميل طلبات الدفع</h2>
            <p className="text-sm">حدث خطأ أثناء جلب الطلبات. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
          </div>
        ) : (
          <PaymentRequestsClient initialRequests={requests || []} />
        )}
      </div>
    </div>
  )
}

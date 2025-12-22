import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DebtsClient from "./debts-client"

export const metadata = {
  title: "طلبات الدفع - الإدارة",
  description: "مراجعة واعتماد طلبات سداد الديون من الطلاب",
}

export default async function DebtsAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify admin role if needed, but the page route might be protected by middleware
  // For now we just fetch pending payment requests

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
    console.error("Error fetching payment requests:", error)
  }

  // Debug log to see exactly what's coming back
  console.log("DEBUG - Requests from Supabase:", JSON.stringify(requests?.[0], null, 2))

  return (
    <main className="min-h-screen bg-gray-50/30 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <DebtsClient initialRequests={requests || []} />
      </div>
    </main>
  )
}

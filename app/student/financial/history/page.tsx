import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import HistoryClient from "./history-client"

export const metadata = {
    title: "سجل المدفوعات",
    description: "عرض تاريخ طلبات الدفع الخاصة بك وحالتها",
}

export default async function PaymentHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const { data: requests, error } = await supabase
        .from("payment_requests")
        .select(`
      *,
      debt:debts(name)
    `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching payment history:", error)
    }

    return (
        <main className="min-h-screen bg-gray-50/30 p-4 md:p-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <HistoryClient initialRequests={requests || []} />
            </div>
        </main>
    )
}

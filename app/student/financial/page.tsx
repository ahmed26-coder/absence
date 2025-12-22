import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import FinancialClient from "./financial-client"

export default async function StudentFinancialPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch Debts for this student
    const { data: debts, error: debtsError } = await supabase
        .from("debts")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

    if (debtsError) {
        console.error("Error fetching debts:", debtsError)
    }

    // Fetch payment requests to potentially show pending status or link them
    // For now we pass debts, and client handles request creation.
    // If we want to show pending requests history in the client, we could fetch them too.
    // Let's pass debts only as per current client design, 
    // maybe client will want requests later.

    return (
        <FinancialClient
            initialDebts={debts || []}
            studentId={user.id}
        />
    )
}

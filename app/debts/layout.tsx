import { redirect } from "next/navigation"
import { getUserRole } from "@/app/auth/actions"
import { createClient } from "@/lib/supabase/server"

export default async function DebtsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const role = await getUserRole()
    if (role !== "admin") {
        redirect("/")
    }

    return <>{children}</>
}

import { redirect, unstable_rethrow } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let user = null
    try {
        const supabase = await createClient()
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        if (error) throw error
        user = authUser

        if (!user) {
            redirect("/auth/login")
        }

        // Check if profile exists. maybeSingle() returns null (not an error)
        // when the row is missing, so a user with no profile row is correctly
        // treated as "incomplete" and sent to onboarding.
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", user.id)
            .maybeSingle()

        // Only skip the onboarding redirect on a genuine transport error;
        // a missing row or empty name means the profile is incomplete.
        if (!profileError && (!profile || !profile.full_name)) {
            redirect("/complete-profile")
        }
    } catch (error) {
        // Let Next.js handle redirect/notFound control-flow signals.
        unstable_rethrow(error)
        console.error("Error in StudentLayout:", error)
    }

    // Reached only when auth failed with a real error (e.g. network).
    if (!user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
                    <h2 className="mb-1 font-bold">خطأ في النظام</h2>
                    <p className="text-sm">تعذّر الاتصال بالخادم. يرجى المحاولة لاحقاً.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    )
}

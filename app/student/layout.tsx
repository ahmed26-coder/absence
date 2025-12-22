import { redirect } from "next/navigation"
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

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", user.id)
            .single()

        // Note: single() returns error if no rows found or multiple found
        // We only care if meaningful error (not just 'fetched' failed)
        // If fetch failed completely (network), logic below catches it.

        if ((!profile || !profile.full_name) && !profileError) {
            redirect("/complete-profile")
        }
    } catch (error) {
        console.error("Error in StudentLayout:", error)
        // If it's a redirect error, re-throw it so Next.js handles it
        if ((error as any)?.message?.includes('NEXT_REDIRECT') || (error as any)?.digest?.includes('NEXT_REDIRECT')) {
            throw error
        }
        // Ideally show a global error page or redirect to login if auth failed
        // For now, let's allow it to render so the inner pages can fail gracefully or show info
    }

    // Safety fallback if user is null after catch (and not redirected)
    if (!user) {
        // This might happen if getUser failed with network error
        // We can't easily redirect inside catch without potentially causing loops if /login also fails
        // But usually we should redirect.
        // Let's rely on the try block redirect.
        // If we are here, it means we caught an error.
        // Better to show an error message.
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    <h2 className="font-bold">خطأ في النظام</h2>
                    <p>تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-0">
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}

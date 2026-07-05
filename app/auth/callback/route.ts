import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch (error) {
                            console.error("Failed to set cookies in callback:", error)
                        }
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Check user role - use maybeSingle() to avoid error if no record exists
            const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", data.user.id)
                .maybeSingle()

            const userRole = roleData?.role || "user"
            const profileCompleted = data.user.user_metadata?.profile_completed

            // Honor an explicit next target (e.g. the password-reset flow).
            const next = searchParams.get("next")
            let redirectPath = "/"

            if (next && next.startsWith("/")) {
                redirectPath = next
            } else if (userRole === "admin") {
                redirectPath = "/"
            } else if (profileCompleted) {
                redirectPath = "/student/dashboard"
            } else {
                redirectPath = "/complete-profile"
            }

            return NextResponse.redirect(`${origin}${redirectPath}`)
        } else {
            console.error("Auth callback error:", error?.code)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=auth_code_error`)
}

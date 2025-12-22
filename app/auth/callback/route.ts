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
            console.log("🔐 User authenticated:", data.user.id)
            console.log("📧 User email:", data.user.email)

            // Check user role - use maybeSingle() to avoid error if no record exists
            const { data: roleData, error: roleError } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", data.user.id)
                .maybeSingle()

            console.log(" Role query result:", roleData)
            console.log(" Role query error:", roleError)

            const userRole = roleData?.role || "user"
            console.log("✅ Final user role:", userRole)

            // Check if profile is completed
            const profileCompleted = data.user.user_metadata?.profile_completed
            console.log("📝 Profile completed:", profileCompleted)

            // Redirect based on role and profile status
            let redirectPath = "/"

            if (userRole === "admin") {
                // Admin users go to home page
                redirectPath = "/"
                console.log("🔑 Admin detected → redirecting to:", redirectPath)
            } else {
                // Regular users
                if (profileCompleted) {
                    // Profile completed → student dashboard
                    redirectPath = "/student/dashboard"
                    console.log("👨‍🎓 User with completed profile → redirecting to:", redirectPath)
                } else {
                    // Profile not completed → complete profile page
                    redirectPath = "/complete-profile"
                    console.log("📋 User needs to complete profile → redirecting to:", redirectPath)
                }
            }

            return NextResponse.redirect(`${origin}${redirectPath}`)
        } else {
            console.error("Auth Callback Error:", error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=auth_code_error`)
}

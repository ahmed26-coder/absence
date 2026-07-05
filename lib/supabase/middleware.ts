import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Redirects must carry any refreshed auth cookies with them
    const redirectTo = (pathname: string) => {
        const url = request.nextUrl.clone()
        url.pathname = pathname
        const redirectResponse = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) =>
            redirectResponse.cookies.set(cookie)
        )
        return redirectResponse
    }

    // Refresh session if expired - required for Server Components
    let user = null
    try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser()
        user = sessionUser
    } catch (error) {
        // If refresh fails (e.g., invalid refresh token), treat as no user
        console.warn("Session refresh failed:", error)
        user = null
    }

    const path = request.nextUrl.pathname

    // Never interfere with the OAuth code exchange
    if (path.startsWith("/auth/callback")) {
        return supabaseResponse
    }

    // 1. Require login for admin tools and the student portal
    const protectedRoutes = ["/debts", "/students", "/analytics", "/student", "/courses", "/notifications"]
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

    if (isProtectedRoute && !user) {
        return redirectTo("/auth/login")
    }

    if (!user) {
        return supabaseResponse
    }

    const profileCompleted = Boolean(user.user_metadata?.profile_completed)

    // The role is only needed for onboarding/auth-page decisions; skip the
    // lookup on regular navigation by students who finished onboarding.
    let isAdmin = false
    if (!profileCompleted || path.startsWith("/auth") || path.startsWith("/complete-profile")) {
        try {
            const { data: roleRow } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .maybeSingle()
            isAdmin = roleRow?.role === "admin"
        } catch (error) {
            console.warn("Role lookup failed in middleware:", error)
        }
    }

    // 2. Onboarding gate: students must complete their profile first.
    // Admins are not students and never go through onboarding.
    if (!isAdmin && !profileCompleted && !path.startsWith("/complete-profile")) {
        return redirectTo("/complete-profile")
    }

    // Students who finished onboarding (and admins) have no business on /complete-profile
    if ((isAdmin || profileCompleted) && path.startsWith("/complete-profile")) {
        return redirectTo(isAdmin ? "/" : "/student/dashboard")
    }

    // 3. Signed-in users have no business on login/register/forgot-password
    if (path.startsWith("/auth")) {
        return redirectTo(isAdmin ? "/" : "/student/dashboard")
    }

    return supabaseResponse
}

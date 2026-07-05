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

    // 0. Check Profile Completion (Onboarding)
    // If user is logged in but hasn't completed profile, force redirect to /complete-profile
    if (user && !user.user_metadata?.profile_completed && !path.startsWith("/complete-profile")) {
        return redirectTo("/complete-profile")
    }

    // If user HAS completed profile, prevent them from seeing /complete-profile again
    if (user && user.user_metadata?.profile_completed && path.startsWith("/complete-profile")) {
        return redirectTo("/student/dashboard")
    }

    // 1. Require login for admin tools and the student portal
    const protectedRoutes = ["/debts", "/students", "/analytics", "/student", "/courses", "/notifications"]
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

    if (isProtectedRoute && !user) {
        return redirectTo("/auth/login")
    }

    // 2. If logged in and trying to access auth pages OR public pages, redirect to dashboard
    if (user && (path === "/" || path.startsWith("/our-sheikh") || path.startsWith("/faq") || path.startsWith("/auth"))) {
        return redirectTo("/student/dashboard")
    }

    return supabaseResponse
}

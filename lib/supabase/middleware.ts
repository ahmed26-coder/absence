import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: any) {
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

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
        const url = request.nextUrl.clone()
        url.pathname = "/complete-profile"
        return NextResponse.redirect(url)
    }

    // NEW: If user HAS completed profile, prevent them from seeing /complete-profile again
    if (user && user.user_metadata?.profile_completed && path.startsWith("/complete-profile")) {
        const url = request.nextUrl.clone()
        url.pathname = "/student/dashboard"
        return NextResponse.redirect(url)
    }

    // 1. If trying to access /debts OR /students OR /analytics OR /student/*, require login
    const protectedRoutes = ["/debts", "/students", "/analytics", "/student"]
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
    }

    // 2. If logged in and trying to access auth pages OR public pages, redirect to dashboard
    const publicPages = ["/", "/our-sheikh", "/faq"]
    const isPublicPage = publicPages.includes(path) || path.startsWith("/auth")

    // Exact match for '/' or starts with others
    // Note: 'path' for root is '/'
    if (user && (path === "/" || path.startsWith("/our-sheikh") || path.startsWith("/faq") || path.startsWith("/auth"))) {
        const url = request.nextUrl.clone()
        url.pathname = "/student/dashboard"
        return NextResponse.redirect(url)
    }

    return response
}

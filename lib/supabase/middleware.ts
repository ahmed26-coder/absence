import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run Supabase code if there is no session
    // getting the user avoids the issues with session being fake
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // BLOCK /debts for non-admin users is handled in the page/layout or via server action check
    // But we can also do a basic check here if we fetch roles.
    // For now, let's just ensure basic auth.

    // 1. If trying to access /debts OR /students OR /analytics, require login
    const protectedRoutes = ["/debts", "/students", "/analytics"]
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
    }

    // 2. If logged in and trying to access auth pages, redirect to home
    if (user && path.startsWith("/auth")) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
    }

    // 3. Admin check for /debts (Optimization: Use a secure cookie or fetch role)
    // Fetching role here might be expensive on every request, usually better to do in Layout or Page
    // But for high security, we can do it.
    // Let's implement basic protection first.

    // NOTE: Full Admin check for /debts will be enforced in the Page/Layout to avoid
    // excessive DB calls in middleware, or we can use a custom claim if we set it up.
    // For this task, we'll start with layout protection, but if requested strict middleware, 
    // we would query the DB here. The prompt asks for "Route protection".

    return supabaseResponse
}

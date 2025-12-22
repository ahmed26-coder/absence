"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function AuthListenerComponent() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams?.get("code")
        if (code) {
            // Redirect to the Server Callback which has the PKCE verifier cookie
            // The callback will determine the correct redirect path based on profile_completed
            const origin = window.location.origin
            const callbackUrl = new URL("/auth/callback", origin)
            callbackUrl.searchParams.set("code", code)

            // Hard redirect to hit the server route
            window.location.href = callbackUrl.toString()
        }
    }, [searchParams])

    return null
}

export function AuthListener() {
    return (
        <Suspense fallback={null}>
            <AuthListenerComponent />
        </Suspense>
    )
}

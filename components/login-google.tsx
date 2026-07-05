"use client"
import { useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function LoginGoogle() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const signInWithGoogle = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            const redirectUrl = `${window.location.origin}/auth/callback`

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: redirectUrl,
                },
            })

            if (error) {
                setError("تعذّر تسجيل الدخول عبر جوجل، حاول مرة أخرى")
                setIsLoading(false)
            }
            // On success the browser redirects to Google; keep the button disabled.
        } catch {
            setError("تعذّر الاتصال بجوجل، تحقق من اتصالك بالإنترنت")
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="my-4 flex items-center gap-2">
                <hr className="flex-1 border-t border-border" />
                <p className="whitespace-nowrap px-2 text-sm text-muted-foreground">أو تابع مع</p>
                <hr className="flex-1 border-t border-border" />
            </div>

            {error && (
                <div className="mb-3 rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert" dir="rtl">
                    {error}
                </div>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="w-full"
                aria-label="تسجيل الدخول باستخدام حساب جوجل"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                    <Image src="/google.svg" width={20} height={20} alt="" aria-hidden="true" className="inline-block" />
                )}
                تسجيل بجوجل
            </Button>
        </>
    )
}

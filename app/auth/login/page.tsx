"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/auth/actions"
import LoginGoogle from "@/components/login-google"

export default function LoginPage() {
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(searchParams.get("error"))

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        // Client-side validation could go here

        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
        // If success, the action redirects, so we don't need to unset loading
    }

    return (
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">تسجيل الدخول</h2>
                <p className="text-sm text-muted-foreground">
                    أدخل بريدك الإلكتروني لتسجيل الدخول إلى حسابك
                </p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" dir="rtl">
                        {error === "auth_code_error" ? "حدث خطأ أثناء المصادقة. الرجاء المحاولة مرة أخرى." : error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        className="text-right"
                        dir="auto"
                    />
                </div>
                <div className="space-y-2">
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        className="text-right"
                        dir="auto"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Link
                        href="/auth/forgot-password"
                        className="text-xs text-muted-foreground cursor-pointer hover:text-primary hover:underline"
                    >
                        نسيت كلمة المرور؟
                    </Link>
                </div>

                <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    تسجيل الدخول
                </Button>
            </form>
            <LoginGoogle />
            <div className="mt-4 text-center text-sm">
                لا تمتلك حساباً؟{" "}
                <Link href="/auth/register" className="text-primary cursor-pointer hover:underline font-semibold">
                    إنشاء حساب جديد
                </Link>
            </div>
        </div>
    )
}
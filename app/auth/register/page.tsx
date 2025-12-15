"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { signup } from "@/app/auth/actions"
import LoginGoogle from "@/components/login-google"

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)

        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("كلمات المرور غير متطابقة")
            setIsLoading(false)
            return
        }

        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">إنشاء حساب جديد</h2>
                <p className="text-sm text-muted-foreground">
                    أدخل بياناتك لإنشاء حساب في المنصة
                </p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" dir="rtl">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="الاسم الثلاثي"
                        required
                        className="text-right"
                        dir="auto"
                    />
                </div>

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
                    <Label htmlFor="password">كلمة المرور</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        className="text-right"
                        dir="auto"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        className="text-right"
                        dir="auto"
                    />
                </div>

                <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    إنشاء الحساب
                </Button>
            </form>
            <LoginGoogle />
            <div className="mt-4 text-center text-sm">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-primary cursor-pointer hover:underline font-semibold">
                    تسجيل الدخول
                </Link>
            </div>
        </div>
    )
}
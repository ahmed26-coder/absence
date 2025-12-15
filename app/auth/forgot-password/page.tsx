"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "@/app/auth/actions"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const result = await forgotPassword(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setSuccess(result.success)
        }
        setIsLoading(false)
    }

    return (
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col space-y-2 text-center">
                <h2 className="text-2xl font-semibold tracking-tight">استعادة كلمة المرور</h2>
                <p className="text-sm text-muted-foreground">
                    أدخل بريدك الإلكتروني لإرسال رابط استعادة كلمة المرور
                </p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" dir="rtl">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600" dir="rtl">
                        {success}
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

                <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    إرسال الرابط
                </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                <Link href="/auth/login" className="flex items-center cursor-pointer justify-center gap-1 text-muted-foreground hover:text-primary">
                    <ArrowRight className="h-4 w-4" /> العودة لتسجيل الدخول
                </Link>
            </div>
        </div>
    )
}
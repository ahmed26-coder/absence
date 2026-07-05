"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center" dir="rtl">
            <div className="rounded-full bg-destructive/10 p-4">
                <RefreshCw className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">حدث خطأ غير متوقع</h1>
            <p className="max-w-md text-muted-foreground">
                عذراً، تعذّر تحميل هذه الصفحة. يمكنك إعادة المحاولة، وإذا استمرت المشكلة تواصل مع الإدارة.
            </p>
            <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                إعادة المحاولة
            </Button>
        </div>
    )
}

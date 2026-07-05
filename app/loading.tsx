import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">جاري التحميل…</span>
        </div>
    )
}

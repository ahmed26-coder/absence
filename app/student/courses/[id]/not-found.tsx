import Link from "next/link"
import { BookX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CourseNotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center" dir="rtl">
            <div className="rounded-full bg-muted p-4">
                <BookX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">الدورة غير موجودة</h1>
            <p className="max-w-md text-muted-foreground">
                لم نتمكن من العثور على هذه الدورة. ربما تم حذفها أو أن الرابط غير صحيح.
            </p>
            <Button asChild>
                <Link href="/student/courses">العودة إلى دوراتي</Link>
            </Button>
        </div>
    )
}

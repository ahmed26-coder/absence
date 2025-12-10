import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "404 – الصفحة غير موجودة",
  description: "عذراً، الصفحة التي تبحث عنها غير موجودة.",
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="space-y-8 text-center">
          {/* Large 404 Number */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-white to-amber-100/40 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl border border-border/60 bg-white/90 p-8 md:p-12 shadow-lg backdrop-blur">
              <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-600 leading-none">
                404
              </h1>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-foreground">الصفحة غير موجودة</h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون قد تم حذفها أو نقل عنوانها.
            </p>
          </div>

          {/* Icon Illustration */}
          <div className="flex justify-center py-4">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/80 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center w-full h-full rounded-full border-2 border-dashed border-primary/20">
                <Home
                  size={64}
                  className="text-primary/30 md:w-20 md:h-20"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2">
              <Link href="/">
                <Home size={18} />
                العودة للرئيسية
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Link href="/students">
                <ArrowRight size={18} />
                قائمة الطلاب
              </Link>
            </Button>
          </div>

          {/* Additional Help Text */}
          <div className="pt-4 border-t border-border/60">
            <p className="text-sm text-muted-foreground">
              إذا استمرت المشكلة،{" "}
              <Link href="/" className="font-semibold text-primary hover:underline">
                تواصل معنا
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

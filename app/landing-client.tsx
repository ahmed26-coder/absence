"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ShieldCheck, BarChart3 } from "lucide-react"

import { Ta2seelLogo } from "@/components/ta2seel-logo"
import { Button } from "@/components/ui/button"

const features = [
  { title: "متابعة حضور الطلاب في الدورات", desc: "سجّل الحضور والغياب والأعذار بسهولة، مع عرض فوري لكل دورة." },
  { title: "إحصائيات لكل طالب ولكل دورة", desc: "نسب حضور تفصيلية وبطاقات سريعة تساعد المعلمين والإدارة على المتابعة." },
  { title: "واجهة عربية سهلة وبسيطة", desc: "تصميم RTL واضح، أزرار مباشرة، وتصفية سريعة للوصول للطالب أو الدورة." },
]

export function LandingContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 pt-28 md:px-8 md:pt-32">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/90 p-8 shadow-md backdrop-blur"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.08),transparent_30%)]" />
          <div className="relative grid gap-8 md:grid-cols-[1.1fr,0.9fr] md:items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Ta2seelLogo animated size="hero" />
                <div>
                  <p className="text-sm font-bold text-foreground">اكاديمية تأصيل للعلوم الشرعية</p>
                  <p className="text-xs text-muted-foreground">نظام متابعة الحضور</p>
                </div>
              </div>
              <h1 className="text-4xl font-black leading-snug text-foreground md:text-5xl">
                منصة عربية لمتابعة الحضور والإحصائيات للمدرسين والإدارة
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                متابعة حضور الطلاب في الدورات الشرعية، إحصائيات، تنظيم، وسهولة استخدام لفرق التدريس والإدارة مع دعم كامل
                للغة العربية وواجهة RTL.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 px-6 py-3">
                  <Link href="/courses">
                    <Sparkles size={18} />
                    البدء في إدارة الدورات
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-5 py-3">
                  <Link href="/students">الانتقال لقائمة الطلاب</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">إحصائيات مباشرة</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">دعم RTL كامل</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">تصميم مخصص</span>
              </div>
            </div>
            <div className="relative rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.05),transparent_35%)]" />
              <div className="relative grid gap-4">
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-primary/10 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">الحضور اليومي</p>
                    <p className="text-xs text-muted-foreground">تسجيل سريع لكل دورة</p>
                  </div>
                  <ShieldCheck size={24} className="text-primary" />
                </div>
                <div className="rounded-xl border border-border/60 bg-white/90 p-4 shadow-xs">
                  <p className="text-sm font-semibold text-foreground mb-2">مقتطف الإحصائيات</p>
                  <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-muted-foreground">
                    <div className="rounded-lg bg-emerald-50 px-3 py-2">
                      <p>حضور</p>
                      <p className="text-lg font-bold text-emerald-700">92%</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 px-3 py-2">
                      <p>غياب</p>
                      <p className="text-lg font-bold text-amber-700">6%</p>
                    </div>
                    <div className="rounded-lg bg-sky-50 px-3 py-2">
                      <p>أعذار</p>
                      <p className="text-lg font-bold text-sky-700">2%</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="rounded-lg border border-border/60 bg-white/80 px-3 py-2 shadow-xs">
                    <p className="font-semibold text-foreground">عدد الطلاب</p>
                    <p className="text-lg font-bold text-primary">+120</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-white/80 px-3 py-2 shadow-xs">
                    <p className="font-semibold text-foreground">عدد الدورات</p>
                    <p className="text-lg font-bold text-emerald-700">18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold text-emerald-700">لمحة سريعة</p>
            <h2 className="text-2xl font-bold text-foreground">كيف يساعد النظام المدرسين والإدارة؟</h2>
            <p className="text-sm text-muted-foreground">
              تنظيم حضور الطلاب، استخراج إحصائيات مباشرة، وتبسيط سير العمل اليومي دون تعقيد.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="rounded-2xl border border-border/60 bg-white/85 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-base font-bold text-foreground">{feature.title}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="grid gap-4 md:grid-cols-[1.2fr,0.8fr] md:items-center">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">فوائد مباشرة للمدرسين والإدارة</h3>
              <ul className="list-disc space-y-2 pr-5 text-sm text-muted-foreground leading-relaxed">
                <li>تسجيل حضور سريع دون أوراق.</li>
                <li>عرض نسب الحضور لكل دورة مع إمكانية التعديل الفوري.</li>
                <li>واجهة عربية واضحة مع دعم كامل للأجهزة المحمولة.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 shadow-inner">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">جاهز للبدء</p>
                  <p className="text-xs text-muted-foreground">جرّب لوحة الدورات وابدأ التسجيل فوراً</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild className="px-5">
                  <Link href="/courses">لوحة الدورات</Link>
                </Button>
                <Button asChild variant="outline" className="px-5">
                  <Link href="/analytics">عرض الإحصائيات</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

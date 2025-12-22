"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, BookOpen, Target, Heart, ShieldCheck, Users, GraduationCap, ArrowLeft } from "lucide-react"
import { Ta2seelLogo } from "@/components/ta2seel-logo"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-provider"
import { enrollInCourse } from "@/lib/supabase-storage"
import type { Course } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

const goals = [
  "نشر العلم الشرعي المؤصل وفق منهج أهل السنة والجماعة.",
  "تيسير سبل طلب العلم لجميع الراغبين من مختلف أنحاء العالم.",
  "تخريج طلبة علم متمكنين يجمعون بين الأصالة والمعاصرة.",
  "تعزيز القيم الأخلاقية والإيمانية في نفوس الدارسين.",
]

const benefits = [
  { title: "منهجية علمية رصينة", desc: "دراسة متدرجة تشمل مختلف الفنون الشرعية.", icon: BookOpen },
  { title: "نخبة من العلماء", desc: "تلقي العلم على يد مشايخ متخصصين ومجازين.", icon: Users },
  { title: "شهادات معتمدة", desc: "الحصول على إجازات وشهادات بعد اجتياز الدورات.", icon: GraduationCap },
  { title: "بيئة تعليمية تفاعلية", desc: "نظام متابعة دقيق وحلقات نقاش مستمرة.", icon: Heart },
]

interface LandingContentProps {
  featuredCourses: Course[]
  user: User | null
}

export function LandingContent({ featuredCourses, user }: LandingContentProps) {
  const router = useRouter()
  const { pushToast } = useToast()

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const ok = await enrollInCourse(user.id, courseId)
    if (ok) {
      pushToast("تم التسجيل في الدورة بنجاح", "success")
    } else {
      pushToast("حدث خطأ أثناء التسجيل", "error")
    }
  }

  const typeLabels: Record<string, string> = {
    public: "عامة",
    private: "خاصة",
    women: "للنساء فقط"
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50" dir="rtl">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-16 pt-12 md:px-8 md:pt-20">

        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/90 p-8 shadow-md backdrop-blur"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.08),transparent_30%)]" />
          <div className="relative grid gap-8 md:grid-cols-[1fr,1fr] md:items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Ta2seelLogo animated size="hero" />
                <div>
                  <p className="text-sm font-bold text-foreground">أكاديمية تأصيل للعلوم الشرعية</p>
                  <p className="text-xs text-muted-foreground">العلم رحم بين أهله</p>
                </div>
              </div>
              <h1 className="text-4xl font-black leading-snug text-foreground md:text-5xl">
                منارة لطلب العلم الشرعي..
                <br />
                <span className="text-primary">أصالة المنهج وعصرية الوسيلة</span>
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                نسعى لتقديم العلم الشرعي الصافي للمسلمين في كل مكان، عبر منهجية علمية مؤصلة وبيئة تعليمية محفزة تجمع بين ثبات المبدأ ومرونة الأسلوب.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 px-6 py-3 text-lg font-bold">
                  <Link href="/auth/register">
                    <Sparkles size={18} />
                    انضم للأكاديمية الآن
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-5 py-3">
                  <Link href="/our-sheikh">تعرف على شيخنا</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">دروس مباشرة</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">تسجيلات مرئية</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-800">مقررات مكتوبة</span>
              </div>
            </div>

            {/* Courses View */}
            <div className="grid gap-4">
              {featuredCourses && featuredCourses.length > 0 ? (
                featuredCourses.map((course) => (
                  <div key={course.id} className="bg-white/70 border border-emerald-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="flex justify-between items-center gap-3">
                      <div className=" flex gap-1.5">
                        <div className="bg-emerald-50 items-center text-emerald-600 p-2.5 rounded-xl">
                          <BookOpen size={30} />
                        </div>
                        <div className="">
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            {typeLabels[course.course_type] || course.course_type}
                          </span>
                          <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{course.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{course.instructor || "نخبة من العلماء"}</p>
                        </div>
                      </div>
                      <Link href="/auth/register">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8">
                          سجل الآن
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center space-y-4 py-8 bg-white/50 rounded-2xl border border-dashed border-emerald-100">
                  <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800">اطلب العلم</h3>
                  <p className="text-sm text-muted-foreground">من المهد إلى اللحد</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* MISSION & VISION */}
        <section className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm border-r-4 border-r-emerald-500"
          >
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">رؤيتنا</h3>
                <p className="text-muted-foreground leading-relaxed">
                  أن نكون المنارة الأولى لتعليم العلوم الشرعية عالمياً، بأسلوب يجمع بين دقة التأصيل العلمي وسهولة الوصول التقني، لبناء جيل مسلم واعي.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm border-r-4 border-r-amber-500"
          >
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">رسالتنا</h3>
                <p className="text-muted-foreground leading-relaxed">
                  إعلاء كلمة الله ونشر سنة رسوله ﷺ، عبر توفير بيئة تعليمية متكاملة تذلل الصعاب أمام طلاب العلم وتقرب لهم التراث الإسلامي العظيم.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* GOALS */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">أهداف الأكاديمية</h2>
            <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {goals.map((goal, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="font-medium text-lg">{goal}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY US / BENEFITS */}
        <section className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">لماذا نحن؟</span>
            <h2 className="text-3xl font-bold text-foreground">مميزات الدراسة في الأكاديمية</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="group rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-emerald-200"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 text-emerald-600 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-700 p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#fff,transparent_20%)]" style={{ backgroundSize: '20px 20px' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold">ابدأ رحلتك في طلب العلم اليوم</h2>
              <p className="text-emerald-50 text-lg leading-relaxed">
                الانضمام للأكاديمية يفتح لك آفاقاً واسعة في العلوم الشرعية. سجل الآن وكن من ورثة الأنبياء.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 text-lg font-bold px-6 py-4 h-auto">
                <Link href="/auth/register">سجل الآن مجاناً</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-emerald-400 text-white bg-none hover:bg-emerald-800/50 hover:text-white text-lg px-6 py-4 h-auto">
                <Link href="/faq">الأسئلة الشائعة</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

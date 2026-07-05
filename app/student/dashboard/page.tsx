import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CalendarCheck, CreditCard, GraduationCap } from "lucide-react"

export default async function StudentDashboardPage() {
    let attendancePercentage = 0
    let totalAttendance = 0
    let coursesCount = 0
    let remaining = 0
    let hadError = false

    // Track which cards have real data vs. a failed fetch, so a failure never
    // masquerades as a genuine zero (e.g. "no debts" when the query errored).
    let coursesAvailable = false
    let debtsAvailable = false
    let attendanceAvailable = false

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const [coursesRes, debtsRes, attendanceRes] = await Promise.all([
            supabase
                .from("student_courses")
                .select("*", { count: "exact", head: true })
                .eq("student_id", user.id),
            supabase
                .from("debts")
                .select("amount_owed, amount_paid")
                .eq("student_id", user.id),
            supabase
                .from("attendance")
                .select("status")
                .eq("student_id", user.id),
        ])

        if (!coursesRes.error) {
            coursesCount = coursesRes.count || 0
            coursesAvailable = true
        } else {
            hadError = true
        }

        if (!debtsRes.error && debtsRes.data) {
            const totalOwed = debtsRes.data.reduce((acc, curr) => acc + (curr.amount_owed || 0), 0)
            const totalPaid = debtsRes.data.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0)
            remaining = totalOwed - totalPaid
            debtsAvailable = true
        } else {
            hadError = true
        }

        if (!attendanceRes.error && attendanceRes.data) {
            const total = attendanceRes.data.length
            const present = attendanceRes.data.filter((r) => r.status === "H").length
            totalAttendance = total
            attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0
            attendanceAvailable = true
        } else {
            hadError = true
        }
    } catch (error) {
        console.error("Error in StudentDashboardPage:", error)
        hadError = true
    }

    const unavailable = <span className="text-muted-foreground">—</span>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">لوحة الطالب</h1>
                <p className="text-muted-foreground">مرحباً بك في بوابتك التعليمية</p>
                {hadError && (
                    <p className="mt-2 text-sm text-destructive" role="alert">
                        تعذّر تحميل بعض البيانات، يرجى تحديث الصفحة والمحاولة مرة أخرى.
                    </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الدورات المسجلة</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coursesAvailable ? coursesCount : unavailable}</div>
                        <p className="text-xs text-muted-foreground">دورة نشطة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
                        <CalendarCheck className={`h-4 w-4 ${attendancePercentage >= 75 ? "text-emerald-500" : attendancePercentage >= 50 ? "text-yellow-500" : "text-red-500"}`} aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        {attendanceAvailable ? (
                            <>
                                <div className={`text-2xl font-bold ${attendancePercentage >= 75 ? "text-emerald-600" : attendancePercentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                    {attendancePercentage}%
                                </div>
                                <p className="text-xs text-muted-foreground">المعدل العام ({totalAttendance} محاضرات)</p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold">{unavailable}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الرسوم المستحقة</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        {debtsAvailable ? (
                            <>
                                <div className={`text-2xl font-bold ${remaining > 0 ? "text-red-600" : "text-emerald-600"}`}>
                                    {remaining} جنيه
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {remaining > 0 ? "مبلغ متبقي للدفع" : "لا توجد ديون"}
                                </p>
                            </>
                        ) : (
                            <div className="text-2xl font-bold">{unavailable}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الإجازات</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">قريباً</div>
                        <p className="text-xs text-muted-foreground">الشهادات المعتمدة</p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">جدول اليوم</h2>
                <div className="flex items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    لا توجد دروس مجدولة اليوم
                </div>
            </div>
        </div>
    )
}

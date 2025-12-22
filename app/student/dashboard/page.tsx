import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CalendarCheck, CreditCard, GraduationCap } from "lucide-react"

export default async function StudentDashboardPage() {
    let attendancePercentage = 0
    let totalAttendance = 0
    let coursesCount = 0
    let debts: any[] | null = []
    let remaining = 0
    let errorMsg = ""

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Default values if no user (should be handled by middleware/layout mostly)
        if (!user) return null

        // Fetch Stats
        // 1. Courses Count
        const { count, error: coursesError } = await supabase
            .from("student_courses")
            .select("*", { count: 'exact', head: true })
            .eq("student_id", user.id)

        if (!coursesError) coursesCount = count || 0

        // 2. Debts
        const { data: debtsData, error: debtsError } = await supabase
            .from("debts")
            .select("amount_owed, amount_paid")
            .eq("student_id", user.id)

        if (!debtsError) {
            debts = debtsData
            const totalOwed = debts?.reduce((acc, curr) => acc + (curr.amount_owed || 0), 0) || 0
            const totalPaid = debts?.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0) || 0
            remaining = totalOwed - totalPaid
        }

        // 3. Attendance Percentage
        const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("status")
            .eq("student_id", user.id)

        if (!attendanceError && attendanceData) {
            const total = attendanceData.length
            const present = attendanceData.filter(r => r.status === 'H').length // 'H' is Present, 'G' is Absent, 'E' is Excused
            totalAttendance = total
            attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0
        }

    } catch (error: any) {
        console.error("Error in StudentDashboardPage:", error)
        errorMsg = error.message || "Failed to load dashboard data"
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة الطالب</h1>
                <p className="text-gray-500">مرحباً بك في بوابتك التعليمية</p>
                {errorMsg && (
                    <p className="text-sm text-red-500 mt-2">عذراً، حدث خطأ أثناء تحميل البيانات: {errorMsg}</p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الدورات المسجلة</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coursesCount}</div>
                        <p className="text-xs text-muted-foreground">دورة نشطة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
                        <CalendarCheck className={`h-4 w-4 ${attendancePercentage >= 75 ? 'text-emerald-500' : attendancePercentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${attendancePercentage >= 75 ? 'text-emerald-600' : attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {attendancePercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">المعدل العام ({totalAttendance} محاضرات)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الرسوم المستحقة</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {remaining} جنيه
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {remaining > 0 ? "مبلغ متبقي للدفع" : "لا توجد ديون"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الإجازات</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">شهادة معتمدة</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity or Schedule could go here */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">جدول اليوم</h2>
                <div className="flex items-center justify-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
                    لا توجد دروس مجدولة اليوم
                </div>
            </div>
        </div>
    )
}

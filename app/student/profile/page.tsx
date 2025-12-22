import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCircle } from "lucide-react"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // Fetch Debts
    const { data: debts } = await supabase
        .from("debts")
        .select("*")
        .eq("student_id", user.id)

    const totalOwed = debts?.reduce((sum, d) => sum + (d.amount_owed || 0), 0) || 0
    const totalPaid = debts?.reduce((sum, d) => sum + (d.amount_paid || 0), 0) || 0
    const remaining = totalOwed - totalPaid

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Personal Info Card */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>المعلومات الشخصية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-50 bg-emerald-100 mb-4 flex items-center justify-center">
                                {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                                    <img
                                        src={profile?.avatar_url || user.user_metadata?.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserCircle className="w-16 h-16 text-emerald-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || "المستخدم"}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>

                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>العمر</Label>
                                    <Input defaultValue={profile?.age} disabled className="bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>الجنس</Label>
                                    <Input defaultValue={profile?.gender === 'male' ? 'ذكر' : 'أنثى'} disabled className="bg-gray-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>رقم الهاتف</Label>
                                <Input defaultValue={profile?.phone} disabled className="bg-gray-50" />
                            </div>

                            <Button className="w-full mt-4" variant="outline" asChild>
                                <a href="/complete-profile">تعديل البيانات</a>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Financial Summary Card */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>الملخص المالي</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-red-600 mb-1">إجمالي المستحق</p>
                                <p className="text-xl font-bold text-gray-900">{totalOwed} ج.م</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-lg">
                                <p className="text-sm text-emerald-600 mb-1">المدفوع</p>
                                <p className="text-xl font-bold text-gray-900">{totalPaid} ج.م</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                            <p className="text-sm text-gray-500 mb-2">المبلغ المتبقي</p>
                            <p className="text-3xl font-bold text-gray-900">{remaining} ج.م</p>
                        </div>

                        {debts && debts.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <h3 className="font-medium text-gray-900">تفاصيل الديون</h3>
                                {debts.map((debt: any) => (
                                    <div key={debt.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                                        <span className="text-gray-700">{debt.name}</span>
                                        <span className="font-medium">
                                            {debt.amount_owed - debt.amount_paid > 0
                                                ? <span className="text-red-600">{debt.amount_owed - debt.amount_paid} متبقي</span>
                                                : <span className="text-emerald-600">تم السداد</span>
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button className="w-full" variant="secondary" asChild>
                            <a href="/student/financial">عرض التفاصيل الكاملة</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

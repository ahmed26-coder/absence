import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"

export default async function CompleteProfilePage() {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/auth/login")
    }

    // 2. Fetch Existing Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // 3. Fetch Existing Debts
    const { data: debts } = await supabase
        .from("debts")
        .select("*")
        .eq("student_id", user.id)

    // 4. Fetch All Available Courses
    const { data: allCourses } = await supabase
        .from("courses")
        .select("*")
        .order("name")

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">استكمال الملف الشخصي</h1>
                    <p className="text-sm text-gray-500">يرجى إكمال بياناتك للمتابعة إلى المنصة</p>
                </div>

                <ProfileForm
                    initialProfile={profile}
                    initialDebts={debts || []}
                    userAvatar={user.user_metadata?.avatar_url}
                    availableCourses={allCourses || []}
                />
            </div>
        </div>
    )
}

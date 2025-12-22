"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "غير مصرح", success: false }
    }

    const fullName = formData.get("fullName") as string
    const age = formData.get("age") as string
    const phone = formData.get("phone") as string
    const gender = formData.get("gender") as string
    const avatarFile = formData.get("avatar") as File | null
    const debtCount = parseInt((formData.get("debt_count") as string) || "0")

    // Basic validation
    if (!fullName || !age || !phone || !gender) {
        return { error: "جميع الحقول مطلوبة", success: false }
    }

    // 1. Determine Avatar URL
    // Priority: New Upload > Existing DB Value > Google Metadata
    let finalAvatarUrl: string | null = null

    // Check existing profile first to see if we have a current avatar
    const { data: existingProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single()

    // Default to what we have in DB, or if null, fall back to Google
    finalAvatarUrl = existingProfile?.avatar_url || user.user_metadata?.avatar_url || null

    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
        try {
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}` // Structure: userId/timestamp.ext

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, {
                    upsert: true
                })

            if (uploadError) {
                console.error("Avatar upload error:", uploadError)
                return { error: `فشل رفع الصورة: ${uploadError.message}`, success: false }
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName)
                // If upload success, this is the new Final URL
                finalAvatarUrl = publicUrl
            }
        } catch (error) {
            console.error("Avatar processing error:", error)
            return { error: "حدث خطأ غير متوقع أثناء معالجة الصورة", success: false }
        }
    }

    // 2. Update Profile
    const profileUpdates: any = {
        id: user.id,
        full_name: fullName,
        age: parseInt(age),
        phone: phone,
        gender: gender,
        updated_at: new Date().toISOString(),
    }

    // Only update avatar_url if we have a valid one (don't set to null if we want to keep it, though logic above handles that)
    if (finalAvatarUrl) {
        profileUpdates.avatar_url = finalAvatarUrl
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileUpdates)

    if (profileError) {
        console.error("Profile update error:", profileError)
        return { error: "حدث خطأ أثناء حفظ الملف الشخصي: " + profileError.message, success: false }
    }

    // 3. Mark User as Completed (Metadata)
    // This allows middleware to skip redirecting them next time
    await supabase.auth.updateUser({
        data: { profile_completed: true }
    })

    // 4. Handle Course Enrollment
    const courseIds = formData.getAll("course_ids") as string[]
    if (courseIds.length > 0) {
        const enrollments = courseIds.map(id => ({
            student_id: user.id,
            course_id: id
        }))

        const { error: enrollError } = await supabase
            .from("student_courses")
            .upsert(enrollments, { onConflict: 'student_id,course_id' })

        if (enrollError) {
            console.error("Enrollment error during profile completion:", enrollError)
            // We don't block the whole process if enrollment fails, but good to log
        }
    }

    // 4. Handle Debts
    if (debtCount >= 0) { // We check this to allow clearing debts if count is 0
        const debtsToInsert = []
        for (let i = 0; i < debtCount; i++) {
            const name = formData.get(`debt_name_${i}`) as string
            const amount = parseFloat(formData.get(`debt_amount_${i}`) as string) || 0
            const paid = parseFloat(formData.get(`debt_paid_${i}`) as string) || 0

            if (name && amount > 0) {
                debtsToInsert.push({
                    student_id: user.id,
                    name,
                    amount_owed: amount,
                    amount_paid: paid,
                    // created_at is automatic usually, but good to have if manual
                })
            }
        }

        // Delete old debts
        const { error: deleteError } = await supabase.from("debts").delete().eq("student_id", user.id)
        if (deleteError) {
            console.error("Error clearing old debts:", deleteError)
            // Check if it's RLS policy failing
            return { error: "فشل تحديث الديون (مسح القديم): " + deleteError.message, success: false }
        }

        if (debtsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from("debts")
                .insert(debtsToInsert)

            if (insertError) {
                console.error("Debts insert error:", insertError)
                return { error: "فشل حفظ الديون الجديدة: " + insertError.message, success: false }
            }
        }
    }

    revalidatePath("/student/profile")
    revalidatePath("/student/dashboard")
    revalidatePath("/", "layout") // Refresh navbar

    // Redirect
    redirect("/student/dashboard")
}

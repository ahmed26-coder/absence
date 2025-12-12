"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { AuthError } from "@supabase/supabase-js"

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Login error:", error)
        return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password) {
        return { error: "الرجاء ملء جميع الحقول المطلوبة" }
    }

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (authError) {
        console.error("Signup error:", authError)
        return { error: authError.message }
    }

    if (authData.user) {
        // 2. Insert into user_roles table as 'user'
        // Note: We use the service_role key or proper RLS policies in a real app.
        // For now assuming the logged-in user can't write to user_roles directly unless we have a trigger.
        // Ideally, a Database Trigger sets the default role.
        // But if we need to do it manually here:

        /* 
         * If you rely on a Trigger (Recommended): You don't need to do anything here.
         * If you rely on client-side insert (NOT Recommended due to RLS):
         */

        // We will assume a trigger exists OR we try to insert if RLS allows self-insert for profile setup.
        // Let's safe-guard by just creating the user. 
        // The instructions said "Default role = user". Usually better handled by DB defaults.
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/")
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get("email") as string

    if (!email) {
        return { error: "الرجاء إدخال البريد الإلكتروني" }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
        console.error("Reset password error:", error)
        return { error: "حدث خطأ أثناء إرسال رابط استعادة كلمة المرور" }
    }

    return { success: "تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني" }
}

export async function isAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // Check user_roles table
    const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()

    if (error || !roleData) {
        // console.error("Error fetching role:", error) 
        // Ignore error, maybe just normal user with no entry yet?
        return false
    }

    return roleData.role === "admin"
}

export async function getUserRole() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()

    return roleData?.role || "user"
}

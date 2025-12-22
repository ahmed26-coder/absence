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
        const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
                user_id: authData.user.id,
                role: "user",
            })

        if (roleError) {
            console.error("Role insert error:", roleError)
            // Don't fail signup if role insert fails, but log it
        }

        // 3. Check if profile exists, if not redirect to complete-profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", authData.user.id)
            .single()

        if (!profile) {
            redirect("/complete-profile")
        }
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

    if (!user) {
        console.log("⚠️ isAdmin: No user found")
        return false
    }

    console.log("🔍 isAdmin: Checking admin status for user:", user.id)

    // Use maybeSingle() instead of single() to avoid error when no record exists
    const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        console.error("❌ isAdmin: Database error:", error)
        return false
    }

    if (!roleData) {
        console.log("⚠️ isAdmin: No role record found for this user")
        return false
    }

    const isAdminUser = roleData.role === "admin"
    console.log("✅ isAdmin: Result =", isAdminUser, "(role:", roleData.role + ")")

    return isAdminUser
}

export async function getUserRole() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.log("⚠️ getUserRole: No user found")
        return null
    }

    console.log("🔍 getUserRole: Checking role for user:", user.id)

    // Use maybeSingle() instead of single() to avoid error when no record exists
    const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role, display_name")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        console.error("❌ getUserRole: Database error:", error)
        console.log("📝 getUserRole: Returning default 'user' role")
        return "user"
    }

    if (!roleData) {
        console.log("⚠️ getUserRole: No role record found for this user")
        console.log("📝 getUserRole: Returning default 'user' role")
        return "user"
    }

    console.log("✅ getUserRole: Found role:", roleData.role)
    console.log("👤 getUserRole: Display name:", roleData.display_name)

    return roleData.role || "user"
}

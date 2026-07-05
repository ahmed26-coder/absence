"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

// Map Supabase auth error codes to Arabic messages for the RTL UI.
// Unknown errors are logged server-side and shown a generic Arabic fallback.
function arabicAuthError(error: { code?: string; message?: string } | null): string {
    const code = error?.code || ""
    const message = (error?.message || "").toLowerCase()

    if (code === "invalid_credentials" || message.includes("invalid login")) {
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة"
    }
    if (code === "email_not_confirmed" || message.includes("not confirmed")) {
        return "يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك أولاً"
    }
    if (code === "user_already_exists" || message.includes("already registered")) {
        return "هذا البريد الإلكتروني مسجّل بالفعل، حاول تسجيل الدخول"
    }
    if (code === "weak_password" || message.includes("password should be")) {
        return "كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل"
    }
    if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || message.includes("rate limit")) {
        return "عدد المحاولات كبير، يرجى الانتظار قليلاً ثم إعادة المحاولة"
    }
    if (code === "validation_failed" || message.includes("invalid email")) {
        return "صيغة البريد الإلكتروني غير صحيحة"
    }
    return "تعذّر إتمام العملية، يرجى المحاولة مرة أخرى"
}

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
        console.error("Login error:", error.code)
        return { error: arabicAuthError(error) }
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = (formData.get("fullName") as string)?.trim()

    if (!email || !password || !fullName) {
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
        console.error("Signup error:", authError.code)
        return { error: arabicAuthError(authError) }
    }

    // Supabase returns an obfuscated user with no identities when the email
    // already exists (to avoid account enumeration) — surface it clearly.
    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        return { error: "هذا البريد الإلكتروني مسجّل بالفعل، حاول تسجيل الدخول" }
    }

    if (authData.user) {
        // 2. Create the role row (display_name is NOT NULL in the schema).
        const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
                user_id: authData.user.id,
                display_name: fullName,
                role: "user",
            })

        if (roleError) {
            // Non-fatal: a DB trigger may already create this row. Log the code only.
            console.error("Role insert error:", roleError.code)
        }
    }

    // 3. Email-confirmation flow: no session means the user must confirm first.
    if (!authData.session) {
        return {
            success:
                "تم إنشاء حسابك بنجاح. يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك ثم تسجيل الدخول.",
        }
    }

    revalidatePath("/", "layout")
    redirect("/complete-profile")
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl && process.env.NODE_ENV === "production") {
        console.error("NEXT_PUBLIC_APP_URL is not set; password-reset links would be invalid")
        return { error: "تعذّر إرسال رابط الاستعادة حالياً، يرجى التواصل مع الإدارة" }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl || "http://localhost:3000"}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
        console.error("Reset password error:", error.code)
        return { error: "حدث خطأ أثناء إرسال رابط استعادة كلمة المرور" }
    }

    return { success: "إذا كان البريد مسجّلاً لدينا، فقد أرسلنا رابط استعادة كلمة المرور إليه" }
}

export async function isAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        console.error("isAdmin: database error:", error.code)
        return false
    }

    return roleData?.role === "admin"
}

export async function getUserRole() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

    if (error) {
        // Fail closed to the least-privileged role.
        console.error("getUserRole: database error:", error.code)
        return "user"
    }

    return roleData?.role || "user"
}

import type { Metadata } from "next"
import { Cairo, Noto_Naskh_Arabic } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ToastProvider } from "@/components/ui/toast-provider"
import { BottomNav } from "@/components/bottom-nav"
import { AuthListener } from "@/components/auth-listener"

const cairo = Cairo({
  variable: "--font-base",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const naskh = Noto_Naskh_Arabic({
  variable: "--font-heading",
  subsets: ["arabic"],
  weight: ["600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "اكاديمية تأصيل للعلوم الشرعية – نظام متابعة الحضور",
  description:
    "نظام عربي لمتابعة حضور الطلاب في الدورات الشرعية، مع إحصائيات لكل طالب ولكل دورة، مصمم لسهولة استخدام المعلمين والإدارة.",
  applicationName: "اكاديمية تأصيل",
  metadataBase: new URL("https://ta2seel.example.com"), // TODO: replace with real domain
  keywords: ["اكاديمية تأصيل", "نظام متابعة الحضور", "حضور الطلاب", "دورات شرعية", "تعليم شرعي"],
  authors: [{ name: "Akademiyat Ta2seel" }],
  openGraph: {
    type: "website",
    url: "https://ta2seel.example.com",
    title: "اكاديمية تأصيل – نظام متابعة الحضور",
    description: "منصة لمتابعة حضور طلاب الدورات الشرعية مع إحصائيات واضحة وسهلة.",
    siteName: "اكاديمية تأصيل",
  },
  twitter: {
    card: "summary_large_image",
    title: "اكاديمية تأصيل – نظام متابعة الحضور",
    description: "منصة عربية لمتابعة حضور طلاب الدورات الشرعية.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { getUserRole } = await import("@/app/auth/actions")
  const { createClient } = await import("@/lib/supabase/server")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user ? await getUserRole() : "user"

  console.log("🏠 Layout - User ID:", user?.id)
  console.log("🏠 Layout - User Email:", user?.email)
  console.log("🏠 Layout - Role from getUserRole():", role)

  // Fetch profile for global avatar
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <html dir="rtl" lang="ar">
      <body className={`${cairo.variable} ${naskh.variable} antialiased`}>
        <ToastProvider>
          <AuthListener />
          <Navbar user={user} role={role || "user"} profile={profile} />
          <main className="pt-20 md:pt-19 pb-20 md:pb-0">{children}</main>
          <BottomNav role={role || "user"} user={user} />
        </ToastProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from "next"
import { Cairo, Noto_Naskh_Arabic } from "next/font/google"
import { MotionConfig } from "framer-motion"
import {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  HREFLANG_ALTERNATES,
  OG_LOCALE,
  OG_LOCALE_ALT,
  THEME_COLOR,
} from "@/lib/site"
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | تعلّم العلوم الشرعية أونلاين`,
    template: `%s | ${SITE_NAME_SHORT}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME_SHORT,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: HREFLANG_ALTERNATES,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: OG_LOCALE,
    alternateLocale: OG_LOCALE_ALT,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME_SHORT,
    statusBarStyle: "default",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
}

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "light",
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

  // Fetch profile for global avatar
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <html dir="rtl" lang="ar">
      <body className={`${cairo.variable} ${naskh.variable} antialiased`}>
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <AuthListener />
            <Navbar user={user} role={role || "user"} profile={profile} />
            <main className="pt-20 md:pt-19 pb-20 md:pb-0">{children}</main>
            <BottomNav role={role || "user"} user={user} />
          </ToastProvider>
        </MotionConfig>
      </body>
    </html>
  )
}
